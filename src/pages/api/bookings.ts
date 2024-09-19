import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  switch (req.method) {
    case "GET":
      return getBookings(req, res);
    case "POST":
      return createBooking(req, res);
    default:
      res.setHeader("Allow", ["GET", "POST"]);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

async function getBookings(req: NextApiRequest, res: NextApiResponse) {
  const { userId, isCoach } = req.query;
  try {
    const bookings = await prisma.booking.findMany({
      where: userId
        ? isCoach === "true"
          ? { slot: { coachId: Number(userId) } }
          : { studentId: Number(userId) }
        : undefined,
      include: {
        slot: { include: { coach: true } },
        student: true,
      },
    });
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch bookings" });
  }
}

async function createBooking(req: NextApiRequest, res: NextApiResponse) {
  const { slotId, studentId } = req.body;
  try {
    const newBooking = await prisma.booking.create({
      data: {
        slotId: Number(slotId),
        studentId: Number(studentId),
      },
      include: { slot: { include: { coach: true } }, student: true },
    });
    await prisma.slot.update({
      where: { id: Number(slotId) },
      data: { isBooked: true },
    });
    res.status(201).json(newBooking);
  } catch (error) {
    res.status(500).json({ error: "Failed to create booking" });
  }
}
