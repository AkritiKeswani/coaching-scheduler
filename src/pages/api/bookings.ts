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
  // ... (existing code remains the same)
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
      include: { coach: true },
    });

    if (!slot) {
      return res.status(404).json({ error: "Slot not found" });
    }

    if (slot.isBooked) {
      return res.status(400).json({ error: "Slot is already booked" });
    }

    // Check if the student exists
    const student = await prisma.user.findUnique({
      where: { id: studentIdNumber },
    });

    if (!student) {
      return res.status(404).json({ error: "Student not found" });
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
              coach: {
                select: {
                  id: true,
                  name: true,
                  phone: true,
                },
              },
            },
          },
          student: {
            select: {
              id: true,
              name: true,
              phone: true,
            },
          },
        },
      }),
      prisma.slot.update({
        where: { id: slotIdNumber },
        data: { isBooked: true },
      }),
    ]);

    // Return booking details including phone numbers
    res.status(201).json({
      id: booking.id,
      coachName: booking.slot.coach.name,
      coachPhone: booking.slot.coach.phone,
      studentName: booking.student.name,
      studentPhone: booking.student.phone,
      slotDetails: {
        id: booking.slot.id,
        startTime: booking.slot.startTime,
        endTime: booking.slot.endTime,
      },
    });
  } catch (error) {
    console.error("Error creating booking:", error);
    res.status(500).json({ error: "Error creating booking" });
  }
}
