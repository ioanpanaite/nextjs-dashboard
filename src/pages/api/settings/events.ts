import type { NextApiRequest, NextApiResponse } from "next";
import connectToDatabase from "@/lib/clientDB";
import { Collections } from "@/constants/database";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  try {
    const { client, db } = await connectToDatabase();
    const events = await db.collection(Collections.Events).find({}).toArray();

    client.close();
    res.status(200).json({ success: true, events });
  } catch (error) {
    console.error(error);
    res.status(400).send({ success: false, message: "Email: something went wrong..." });
  }
}