import corsMiddleware from "@/cors";
import type { NextApiRequest, NextApiResponse } from "next";
import connectToDatabase from "@/lib/clientDB";
import { Collections } from "@/constants/database";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  await corsMiddleware(req, res);

  const { userEmail } = req.body

  try {
    const { client, db } = await connectToDatabase();
    const collection = db.collection(Collections.User);

    // Check existing user by email
    const currentUser = await collection.findOne({ email: userEmail });
    if (!currentUser) {
      client.close();
      res.status(422).json({ success: false, message: "Invalid user." })
      return;
    }

    // Delete account
    await collection.updateOne(
      { _id: currentUser?._id },
      {
        $set: {
          status: 'deleted',
          updatedAt: new Date().toISOString(),
        }
      }
    )

    res.status(200).json({ success: true, message: 'Deleted account.' })
  } catch (error) {
    console.error(error);
    res.status(400).send({ success: false, message: "Account: something went wrong..." });
  }
}