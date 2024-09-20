// pages/api/slots.ts

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
  let coachId = req.query.coachId;
  let isBooked = req.query.isBooked;

  if (Array.isArray(coachId)) coachId = coachId[0];
  if (Array.isArray(isBooked)) isBooked = isBooked[0];

  const coachIdNumber = coachId ? parseInt(coachId, 10) : undefined;
  const isBookedBoolean =
    isBooked !== undefined ? isBooked === "true" : undefined;

  if (coachId && isNaN(coachIdNumber)) {
    return res.status(400).json({ error: "Invalid coachId" });
  }

  try {
    const slots = await prisma.slot.findMany({
      where: {
        ...(coachIdNumber !== undefined && { coachId: coachIdNumber }),
        ...(isBookedBoolean !== undefined && { isBooked: isBookedBoolean }),
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

  if (!startTime) {
    return res.status(400).json({ error: "startTime is required" });
  }

  if (!coachId) {
    return res.status(400).json({ error: "coachId is required" });
  }

  const start = new Date(startTime);

  if (isNaN(start.getTime())) {
    return res.status(400).json({ error: "Invalid startTime format" });
  }

  const coachIdNumber = parseInt(coachId, 10);

  if (isNaN(coachIdNumber)) {
    return res.status(400).json({ error: "Invalid coachId" });
  }

  try {
    // Check if the coach exists and is a coach
    const coachExists = await prisma.user.findUnique({
      where: { id: coachIdNumber },
    });

    if (!coachExists || !coachExists.isCoach) {
      return res.status(404).json({ error: "Coach not found" });
    }

    const end = new Date(start.getTime() + 2 * 60 * 60 * 1000); // Add 2 hours

    const slot = await prisma.slot.create({
      data: {
        startTime: start,
        endTime: end,
        coach: { connect: { id: coachIdNumber } },
      },
    });

    res.status(201).json(slot);
  } catch (error) {
    console.error("Error creating slot:", error);
    res.status(500).json({ error: "Error creating slot" });
  }
}
