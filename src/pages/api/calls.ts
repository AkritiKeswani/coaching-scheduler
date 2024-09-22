import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  switch (method) {
    case "POST":
      return handleCreateCall(req, res);
    default:
      res.setHeader("Allow", ["POST"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}

async function handleCreateCall(req: NextApiRequest, res: NextApiResponse) {
  const { bookingId, coachId, satisfaction, notes } = req.body;

  if (!bookingId || !coachId || !satisfaction || !notes) {
    return res.status(400).json({ error: "All fields are required" });
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
    // Check if the booking exists and belongs to the coach
    const booking = await prisma.booking.findUnique({
      where: { id: bookingIdNumber },
      include: { slot: true },
    });

    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    if (booking.slot.coachId !== coachIdNumber) {
      return res
        .status(403)
        .json({ error: "This booking does not belong to the coach" });
    }

    // Check if a call already exists for this booking
    const existingCall = await prisma.call.findUnique({
      where: { bookingId: bookingIdNumber },
    });

    if (existingCall) {
      return res
        .status(400)
        .json({ error: "Feedback has already been recorded for this booking" });
    }

    // Create the call record
    const call = await prisma.call.create({
      data: {
        booking: { connect: { id: bookingIdNumber } },
        coach: { connect: { id: coachIdNumber } },
        satisfaction: satisfactionNumber,
        notes,
      },
      include: {
        booking: {
          include: {
            slot: true,
            student: true,
          },
        },
      },
    });

    res.status(201).json({
      id: call.id,
      satisfaction: call.satisfaction,
      notes: call.notes,
      date: call.date,
      booking: {
        id: call.booking.id,
        slot: {
          id: call.booking.slot.id,
          startTime: call.booking.slot.startTime,
          endTime: call.booking.slot.endTime,
        },
        student: {
          id: call.booking.student.id,
          name: call.booking.student.name,
        },
      },
    });
  } catch (error) {
    console.error("Error creating call:", error);
    res.status(500).json({ error: "Error creating call" });
  }
}
