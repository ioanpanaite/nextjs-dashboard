import corsMiddleware from "@/cors";
import type { NextApiRequest, NextApiResponse } from "next";
import connectToDatabase from "@/lib/clientDB";
import { Collections, Status } from "@/constants/database";
import { accountSid, authToken, serviceId } from "@/constants/twilio";

const twilioClient = require('twilio')(accountSid, authToken);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  await corsMiddleware(req, res);

  const { email, code } = req.body

  try {
    const userEmail = Buffer.from(email, 'base64').toString('ascii');
    // Get user collection
    const { client, db } = await connectToDatabase();
    const userCollection = db.collection(Collections.User);
    const user = await userCollection.findOne({ email: userEmail });

    if (!user) {
      client.close();
      res.status(200).json({ success: false, message: 'Invalid user!' });
      return;
    }

    const emailVerify = await twilioClient.verify.v2.services(serviceId)
      .verificationChecks
      .create({ to: userEmail, code: code });

    if (emailVerify.status === Status.APPROVED) {
      // Update email verification status
      await userCollection.updateOne(
        { _id: user?._id },
        {
          $set: {
            emailVerified: true,
            status: Status.ACTIVE,
            updatedAt: new Date().toISOString(),
          }
        }
      )
      res.status(200).json({ success: true, message: "Email verified successfully." });
    } else {
      res.status(200).json({ success: false, message: "It's wrong code. Please check your email." });
    }
  } catch (error) {
    console.error(error);
    res.status(400).send({ success: false, message: "Email Verification: something went wrong..." });
  }
}