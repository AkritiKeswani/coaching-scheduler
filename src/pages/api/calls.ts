// pages/api/calls.ts

import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../lib/prisma"; // Adjust the path as needed

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
  const { coachId } = req.query;

  try {
    const calls = await prisma.call.findMany({
      where: { coachId: Number(coachId) },
      include: {
        booking: {
          include: {
            student: true,
            slot: true,
          },
        },
      },
    });

    res.status(200).json(calls);
  } catch (error) {
    console.error("Error fetching calls:", error);
    res.status(500).json({ error: "Error fetching calls" });
  }
}

async function handleCreateCall(req: NextApiRequest, res: NextApiResponse) {
  const { bookingId, coachId, satisfaction, notes } = req.body;

  try {
    // Ensure the call hasn't already been recorded
    const existingCall = await prisma.call.findUnique({
      where: { bookingId: Number(bookingId) },
    });

    if (existingCall) {
      return res
        .status(400)
        .json({ error: "Feedback for this call has already been recorded" });
    }

    const call = await prisma.call.create({
      data: {
        booking: { connect: { id: Number(bookingId) } },
        coach: { connect: { id: Number(coachId) } },
        satisfaction: Number(satisfaction),
        notes,
      },
    });

    res.status(201).json(call);
  } catch (error) {
    console.error("Error recording call feedback:", error);
    res.status(500).json({ error: "Error recording call feedback" });
  }
}
