// pages/api/bookings.ts

import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../lib/prisma";

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
  let studentId = req.query.studentId;
  let coachId = req.query.coachId;

  // Ensure single values
  if (Array.isArray(studentId)) studentId = studentId[0];
  if (Array.isArray(coachId)) coachId = coachId[0];

  if (!studentId && !coachId) {
    return res.status(400).json({
      error: "Please provide studentId or coachId as a query parameter.",
    });
  }

  // Parse IDs
  const studentIdNumber = studentId ? parseInt(studentId, 10) : undefined;
  const coachIdNumber = coachId ? parseInt(coachId, 10) : undefined;

  if (
    (studentId && isNaN(studentIdNumber)) ||
    (coachId && isNaN(coachIdNumber))
  ) {
    return res.status(400).json({ error: "Invalid studentId or coachId" });
  }

  try {
    const bookings = await prisma.booking.findMany({
      where: {
        ...(studentIdNumber && { studentId: studentIdNumber }),
        ...(coachIdNumber && { slot: { coachId: coachIdNumber } }),
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

  if (!slotId || !studentId) {
    return res.status(400).json({ error: "slotId and studentId are required" });
  }

  const slotIdNumber = parseInt(slotId, 10);
  const studentIdNumber = parseInt(studentId, 10);

  if (isNaN(slotIdNumber) || isNaN(studentIdNumber)) {
    return res.status(400).json({ error: "Invalid slotId or studentId" });
  }

  try {
    // Check if the slot exists and is available
    const slot = await prisma.slot.findUnique({
      where: { id: slotIdNumber },
    });

    if (!slot) {
      return res.status(404).json({ error: "Slot not found" });
    }

    if (slot.isBooked) {
      return res.status(400).json({ error: "Slot is already booked" });
    }

    // Use a transaction to ensure atomicity
    const [booking] = await prisma.$transaction([
      prisma.booking.create({
        data: {
          slot: { connect: { id: slotIdNumber } },
          student: { connect: { id: studentIdNumber } },
        },
        include: {
          slot: {
            include: {
              coach: true,
            },
          },
          student: true,
        },
      }),
      prisma.slot.update({
        where: { id: slotIdNumber },
        data: { isBooked: true },
      }),
    ]);

    res.status(201).json(booking);
  } catch (error) {
    console.error("Error creating booking:", error);
    res.status(500).json({ error: "Error creating booking" });
  }
}
