import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../lib/prisma";
import { getSession } from "next-auth/client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const session = await getSession({ req });

  if (!session || !session.user.isCoach) {
    return res.status(403).json({ error: "Unauthorized" });
  }

  const { callId, satisfaction, notes } = req.body;
  const coachId = session.user.id;

  if (
    !callId ||
    !satisfaction ||
    satisfaction < 1 ||
    satisfaction > 5 ||
    !notes
  ) {
    return res.status(400).json({ error: "Invalid input data" });
  }

  try {
    const call = await prisma.call.findUnique({
      where: { id: callId },
    });

    if (!call || call.coachId !== coachId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    await prisma.call.update({
      where: { id: callId },
      data: {
        satisfaction,
        notes,
      },
    });

    res.status(200).json({ message: "Feedback submitted successfully" });
  } catch (error) {
    console.error("Error submitting feedback:", error);
    res
      .status(500)
      .json({ error: "An error occurred while submitting feedback" });
  }
}
