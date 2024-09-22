import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  switch (method) {
    case "GET":
      return handleGetSlots(req, res);
    case "POST":
      return handleCreateSlot(req, res);
    default:
      res.setHeader("Allow", ["GET", "POST"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}

async function handleGetSlots(req: NextApiRequest, res: NextApiResponse) {
  const { coachId, isBooked } = req.query;

  let where: any = {};

  if (coachId) {
    const coachIdNumber = parseInt(coachId as string, 10);
    if (isNaN(coachIdNumber)) {
      return res.status(400).json({ error: "Invalid coachId" });
    }
    where.coachId = coachIdNumber;
  }

  if (isBooked !== undefined) {
    where.isBooked = isBooked === "true";
  }

  try {
    const slots = await prisma.slot.findMany({
      where,
      include: {
        coach: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
        booking: {
          include: {
            student: {
              select: {
                id: true,
                name: true,
                phone: true,
              },
            },
          },
        },
      },
      orderBy: {
        startTime: "asc",
      },
    });

    res.status(200).json(slots);
  } catch (error) {
    console.error("Error fetching slots:", error);
    res.status(500).json({ error: "Error fetching slots" });
  }
}

async function handleCreateSlot(req: NextApiRequest, res: NextApiResponse) {
  const { startTime, coachId } = req.body;

  if (!startTime || !coachId) {
    return res
      .status(400)
      .json({ error: "startTime and coachId are required" });
  }

  const coachIdNumber = parseInt(coachId, 10);

  if (isNaN(coachIdNumber)) {
    return res.status(400).json({ error: "Invalid coachId" });
  }

  try {
    const startDateTime = new Date(startTime);
    const endDateTime = new Date(startDateTime.getTime() + 2 * 60 * 60 * 1000); // 2 hours later

    const newSlot = await prisma.slot.create({
      data: {
        startTime: startDateTime,
        endTime: endDateTime,
        coach: { connect: { id: coachIdNumber } },
      },
      include: {
        coach: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
      },
    });

    res.status(201).json(newSlot);
  } catch (error) {
    console.error("Error creating slot:", error);
    res.status(500).json({ error: "Error creating slot" });
  }
}
