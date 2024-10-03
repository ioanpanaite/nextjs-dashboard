import corsMiddleware from "@/cors";
import type { NextApiRequest, NextApiResponse } from "next";
import connectToDatabase from "@/lib/clientDB";
import { Collections, IUser, Status } from "@/constants/database";
import bcrypt from "bcrypt";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  if (req.method !== "POST") {
    res.status(405).send('Not correct request type')
  }
  await corsMiddleware(req, res);

  const data = req.body

  if (!data.email || !data.email.includes('@')) {
    res.status(422).json({ success: false, message: "Invalid email input." })
  }

  try {
    const { client, db } = await connectToDatabase();
    const collection = db.collection(Collections.User);

    // Check existing user by email
    const currentUser = await collection.findOne({ email: data.email });
    if (!currentUser) {
      client.close();
      res.status(422).json({ success: false, message: "Invalid user." })
      return;
    }

    const hashedPassword = data.password ? await bcrypt.hash(data.password, 10) : null;
    const timeAt = new Date().toISOString();

    const username = data.fullname.toLowerCase().split(' ').join('_')

    // Update personal info 
    await collection.updateOne(
      { _id: currentUser._id },
      {
        $set: {
          fullname: data.fullname,
          username: username,
          email: data.email,
          password: hashedPassword,
          country: data.country,
          crypto: data.crypto,
          telegram: data.telegram_user,
          twofactorEnabled: false,
          primary_exchange: data.primary_exchange,
          // status: Status.PENDING,
          updatedAt: timeAt
        }
      }
    )

    res.status(200).json({ success: true, message: 'Profile updated.' })
  } catch (error) {
    console.error(error);
    res.status(400).send({ success: false, message: "Profile: something went wrong..." });
  }
}