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
  const { studentId, coachId } = req.query;

  if (!studentId && !coachId) {
    return res
      .status(400)
      .json({ error: "Either studentId or coachId is required" });
  }

  let where = {};
  if (studentId) {
    const studentIdNumber = parseInt(studentId as string, 10);
    if (isNaN(studentIdNumber)) {
      return res.status(400).json({ error: "Invalid studentId" });
    }
    where = { studentId: studentIdNumber };
  } else if (coachId) {
    const coachIdNumber = parseInt(coachId as string, 10);
    if (isNaN(coachIdNumber)) {
      return res.status(400).json({ error: "Invalid coachId" });
    }
    where = { slot: { coachId: coachIdNumber } };
  }

  try {
    const bookings = await prisma.booking.findMany({
      where,
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

    // Return booking details in the same format as GET request
    res.status(201).json({
      id: booking.id,
      slot: {
        id: booking.slot.id,
        startTime: booking.slot.startTime,
        endTime: booking.slot.endTime,
        coach: {
          id: booking.slot.coach.id,
          name: booking.slot.coach.name,
          phone: booking.slot.coach.phone,
        },
      },
      student: {
        id: booking.student.id,
        name: booking.student.name,
        phone: booking.student.phone,
      },
      call: null, // Since this is a new booking, there's no call data yet
    });
  } catch (error) {
    console.error("Error creating booking:", error);
    res.status(500).json({ error: "Error creating booking" });
  }
}
