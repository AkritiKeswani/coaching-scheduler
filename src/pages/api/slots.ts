// pages/api/slots.ts

import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../lib/prisma"; // Adjust the path as needed

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

  try {
    const slots = await prisma.slot.findMany({
      where: {
        coachId: coachId ? Number(coachId) : undefined,
        isBooked: isBooked !== undefined ? isBooked === "true" : undefined,
      },
      include: {
        coach: true,
        booking: {
          include: {
            student: true,
          },
        },
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

  try {
    const start = new Date(startTime);
    const end = new Date(start.getTime() + 2 * 60 * 60 * 1000); // Add 2 hours

    const slot = await prisma.slot.create({
      data: {
        startTime: start,
        endTime: end,
        coach: { connect: { id: Number(coachId) } },
      },
    });

    res.status(201).json(slot);
  } catch (error) {
    console.error("Error creating slot:", error);
    res.status(500).json({ error: "Error creating slot" });
  }
}
