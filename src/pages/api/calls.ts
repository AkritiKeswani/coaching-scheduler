// pages/api/calls.ts

import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  switch (method) {
    case "GET":
      return handleGetCalls(req, res);
    case "POST":
      return handleCreateCall(req, res);
    default:
      res.setHeader("Allow", ["GET", "POST"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}

async function handleGetCalls(req: NextApiRequest, res: NextApiResponse) {
  let coachId = req.query.coachId;

  if (Array.isArray(coachId)) coachId = coachId[0];

  if (!coachId) {
    return res.status(400).json({ error: "coachId is required" });
  }

  const coachIdNumber = parseInt(coachId, 10);

  if (isNaN(coachIdNumber)) {
    return res.status(400).json({ error: "Invalid coachId" });
  }

  try {
    const calls = await prisma.call.findMany({
      where: { coachId: coachIdNumber },
      include: {
        booking: {
          include: {
            student: {
              select: {
                id: true,
                name: true,
                phoneNumber: true,
              },
            },
            slot: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Format the response to include all necessary information
    const formattedCalls = calls.map((call) => ({
      id: call.id,
      satisfaction: call.satisfaction,
      notes: call.notes,
      createdAt: call.createdAt,
      studentName: call.booking.student.name,
      studentPhoneNumber: call.booking.student.phoneNumber,
      slotDetails: {
        startTime: call.booking.slot.startTime,
        endTime: call.booking.slot.endTime,
      },
    }));

    res.status(200).json(formattedCalls);
  } catch (error) {
    console.error("Error fetching calls:", error);
    res.status(500).json({ error: "Error fetching calls" });
  }
}

async function handleCreateCall(req: NextApiRequest, res: NextApiResponse) {
  const { bookingId, coachId, satisfaction, notes } = req.body;

  if (!bookingId || !coachId || satisfaction === undefined || !notes) {
    return res.status(400).json({
      error: "bookingId, coachId, satisfaction, and notes are required",
    });
  }

  const bookingIdNumber = parseInt(bookingId, 10);
  const coachIdNumber = parseInt(coachId, 10);
  const satisfactionNumber = parseInt(satisfaction, 10);

  if (
    isNaN(bookingIdNumber) ||
    isNaN(coachIdNumber) ||
    isNaN(satisfactionNumber)
  ) {
    return res
      .status(400)
      .json({ error: "Invalid bookingId, coachId, or satisfaction" });
  }

  if (satisfactionNumber < 1 || satisfactionNumber > 5) {
    return res
      .status(400)
      .json({ error: "Satisfaction must be between 1 and 5" });
  }

  try {
    // Ensure the call hasn't already been recorded
    const existingCall = await prisma.call.findUnique({
      where: { bookingId: bookingIdNumber },
    });

    if (existingCall) {
      return res
        .status(400)
        .json({ error: "Feedback for this call has already been recorded" });
    }

    // Retrieve the booking
    const booking = await prisma.booking.findUnique({
      where: { id: bookingIdNumber },
      include: {
        slot: true,
      },
    });

    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    if (booking.slot.coachId !== coachIdNumber) {
      return res.status(403).json({
        error: "You are not authorized to record feedback for this call",
      });
    }

    // Create the call record
    const call = await prisma.call.create({
      data: {
        booking: { connect: { id: bookingIdNumber } },
        coach: { connect: { id: coachIdNumber } },
        satisfaction: satisfactionNumber,
        notes,
      },
    });

    res.status(201).json(call);
  } catch (error) {
    console.error("Error recording call feedback:", error);
    res.status(500).json({ error: "Error recording call feedback" });
  }
}
