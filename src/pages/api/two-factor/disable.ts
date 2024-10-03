import corsMiddleware from "@/cors";
import type { NextApiRequest, NextApiResponse } from "next";
import connectToDatabase from "@/lib/clientDB";
import { Collections, Status } from "@/constants/database";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  await corsMiddleware(req, res);

  const { email } = req.body;

  try {
    const { client, db } = await connectToDatabase();
    // Check existing user by email
    const currentUser = await db.collection(Collections.User).findOne({ email: email });
    if (!currentUser) {
      client.close();
      res.status(422).json({ success: false, message: "Invalid user." })
      return;
    }

    const timeAt = (new Date()).toISOString();
    await db.collection(Collections.User).updateOne(
      { _id: currentUser._id },
      {
        $set: {
          twofactorEnabled: false,
          updatedAt: timeAt
        }
      }
    )
    await db.collection(Collections.TwoFactor).updateOne(
      { userId: currentUser._id.toString() },
      {
        $set: {
          twofactorStatus: Status.DISABLED,
          updatedAt: new Date().toISOString(),
        }
      }
    );

    res.status(200).json({ success: true, message: "Two-Factor disabled successfully." });
  } catch (error) {
    console.error(error);
    res.status(400).send({ success: false, message: "Two-Factor: something went wrong..." });
  }
}