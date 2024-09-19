import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  switch (req.method) {
    case "GET":
      return getCalls(req, res);
    case "POST":
      return createCall(req, res);
    default:
      res.setHeader("Allow", ["GET", "POST"]);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

async function getCalls(req: NextApiRequest, res: NextApiResponse) {
  const { coachId } = req.query;
  try {
    const calls = await prisma.call.findMany({
      where: coachId ? { coachId: Number(coachId) } : undefined,
      include: { booking: { include: { student: true, slot: true } } },
    });
    res.status(200).json(calls);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch calls" });
  }
}

async function createCall(req: NextApiRequest, res: NextApiResponse) {
  const { bookingId, satisfaction, notes } = req.body;
  try {
    const newCall = await prisma.call.create({
      data: {
        bookingId: Number(bookingId),
        satisfaction: Number(satisfaction),
        notes,
      },
      include: { booking: { include: { student: true, slot: true } } },
    });
    res.status(201).json(newCall);
  } catch (error) {
    res.status(500).json({ error: "Failed to create call" });
  }
}
