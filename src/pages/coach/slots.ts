//slot creation API route
import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    try {
      const { date, time, coachId } = req.body;
      const startTime = new Date(`${date}T${time}`);
      const endTime = new Date(startTime.getTime() + 2 * 60 * 60 * 1000); // 2 hours later

      const slot = await prisma.slot.create({
        data: {
          startTime,
          endTime,
          coach: { connect: { id: coachId } },
        },
      });

      res.status(201).json(slot);
    } catch (error) {
      res.status(400).json({ error: "Failed to create slot" });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
