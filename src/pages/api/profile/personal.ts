import corsMiddleware from "@/cors";
import type { NextApiRequest, NextApiResponse } from "next";
import connectToDatabase from "@/lib/clientDB";
import { Collections, IUser } from "@/constants/database";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  await corsMiddleware(req, res);

  const { currentUserEmail, email } = req.body

  if (!email || !email.includes('@')) {
    res.status(422).json({ success: false, message: "Invalid email input." })
  }

  try {
    const { client, db } = await connectToDatabase();
    const collection = db.collection(Collections.User);

    // Check existing user by email
    const currentUser = await collection.findOne({ email: currentUserEmail });
    if (!currentUser) {
      client.close();
      res.status(422).json({ success: false, message: "Invalid user." })
      return;
    }

    // Update personal info 
    await collection.updateOne(
      { _id: currentUser._id },
      {
        $set: {
          email: email,
          updatedAt: (new Date()).toISOString()
        }
      }
    )

    res.status(200).json({ success: true, message: 'Personal information changed successfully.' })
  } catch (error) {
    console.error(error);
    res.status(400).send({ success: false, message: "Personal: something went wrong..." });
  }
}