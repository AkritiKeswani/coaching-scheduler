// pages/api/bookings.ts

import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../lib/prisma"; // Ensure the path to prisma client is correct

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  switch (method) {
    case "GET":
      return handleGetBookings(req, res);
    case "POST":
      return handleCreateBooking(req, res);
    default:
      res.setHeader("Allow", ["GET", "POST"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}

async function handleGetBookings(req: NextApiRequest, res: NextApiResponse) {
  const { studentId, coachId } = req.query;

  if (!studentId && !coachId) {
    return res.status(400).json({
      error: "Please provide studentId or coachId as a query parameter.",
    });
  }

  try {
    const bookings = await prisma.booking.findMany({
      where: {
        ...(studentId && { studentId: Number(studentId) }),
        ...(coachId && { slot: { coachId: Number(coachId) } }),
      },
      include: {
        slot: {
          include: {
            coach: true,
          },
        },
        student: true,
        call: true,
      },
    });

    res.status(200).json(bookings);
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({ error: "Error fetching bookings" });
  }
}

async function handleCreateBooking(req: NextApiRequest, res: NextApiResponse) {
  const { slotId, studentId } = req.body;

  try {
    // Check if the slot exists and is available
    const slot = await prisma.slot.findUnique({
      where: { id: Number(slotId) },
    });

    if (!slot) {
      return res.status(404).json({ error: "Slot not found" });
    }

    if (slot.isBooked) {
      return res.status(400).json({ error: "Slot is already booked" });
    }

    // Create the booking
    const booking = await prisma.booking.create({
      data: {
        slot: { connect: { id: Number(slotId) } },
        student: { connect: { id: Number(studentId) } },
      },
      include: {
        slot: {
          include: {
            coach: true,
          },
        },
        student: true,
      },
    });

    // Update the slot to mark it as booked
    await prisma.slot.update({
      where: { id: Number(slotId) },
      data: { isBooked: true },
    });

    res.status(201).json(booking);
  } catch (error) {
    console.error("Error creating booking:", error);
    res.status(500).json({ error: "Error creating booking" });
  }
}
