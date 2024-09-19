import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  switch (req.method) {
    case "GET":
      return getSlots(req, res);
    case "POST":
      return createSlot(req, res);
    default:
      res.setHeader("Allow", ["GET", "POST"]);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

async function getSlots(req: NextApiRequest, res: NextApiResponse) {
  const { coachId } = req.query;
  try {
    const slots = await prisma.slot.findMany({
      where: coachId ? { coachId: Number(coachId) } : undefined,
      include: { coach: true, booking: { include: { student: true } } },
    });
    res.status(200).json(slots);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch slots" });
  }
}

async function createSlot(req: NextApiRequest, res: NextApiResponse) {
  const { startTime, coachId } = req.body;
  try {
    const start = new Date(startTime);
    const end = new Date(start.getTime() + 2 * 60 * 60 * 1000); // 2 hours later
    const newSlot = await prisma.slot.create({
      data: {
        startTime: start,
        endTime: end,
        coachId: Number(coachId),
      },
    });
    res.status(201).json(newSlot);
  } catch (error) {
    res.status(500).json({ error: "Failed to create slot" });
  }
}
