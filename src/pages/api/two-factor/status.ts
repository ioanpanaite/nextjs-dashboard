import { Collections, IUser } from "@/constants/database";
import corsMiddleware from "@/cors";
import connectToDatabase from "@/lib/clientDB";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  await corsMiddleware(req, res);

  try {
    const { email } = req.body;

    // Get user collection
    const { client, db } = await connectToDatabase();
    const collection = db.collection<IUser>(Collections.User);
    const user = await collection.findOne({ email: email });

    if (!user) { 
      client.close();     
      res.status(200).json({ success: false, message: "Invalid user." });
      return;
    }

    // If two factor is not enabled, 
    // it should be direct dashboard without two factor check
    if (user.twofactorEnabled) { 
      client.close(); 
      res.status(200).json({ success: true, message: "Two factor is enabled." });
    } else {
      client.close(); 
      res.status(200).json({ success: false, message: "Two factor is not enabled" });
    }

  } catch (error) {
    console.log("Two-Factor: ", error);
    res.status(400).send({ success: false, message: "Something went wrong." });
  }
}