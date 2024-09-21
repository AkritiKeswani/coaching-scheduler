// pages/api/users/[id].ts

import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log("API route called:", req.method, req.url);
  console.log("Request body:", req.body);

  const { method } = req;
  const userId = parseInt(req.query.id as string, 10);

  if (isNaN(userId)) {
    console.error("Invalid user ID:", req.query.id);
    return res.status(400).json({ error: "Invalid user ID" });
  }

  switch (method) {
    case "PATCH":
      try {
        const { phone } = req.body;

        if (!phone) {
          console.error("Phone number is required");
          return res.status(400).json({ error: "Phone number is required" });
        }

        console.log("Updating user:", { userId, phone });

        const updatedUser = await prisma.user.update({
          where: { id: userId },
          data: { phone },
        });

        console.log("User updated successfully:", updatedUser);

        res.status(200).json(updatedUser);
      } catch (error) {
        console.error("Error updating user:", error);
        res
          .status(500)
          .json({ error: "Error updating user", details: error.message });
      }
      break;
    default:
      console.error("Method not allowed:", method);
      res.setHeader("Allow", ["PATCH"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
