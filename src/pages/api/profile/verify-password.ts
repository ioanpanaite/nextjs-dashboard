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

  const { currentUserEmail, code } = req.body
  
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
    
    const emailVerify = await twilioClient.verify.v2.services(serviceId)
      .verificationChecks
      .create({ to: currentUserEmail, code: code });

    if (emailVerify.status === Status.APPROVED) {
      const passwordNew = currentUser.passwordNew;  
      await collection.updateOne(
        { _id: currentUser?._id },
        {
          $set: {
            passwordVerify: true,
            password: passwordNew,
            updatedAt: new Date().toISOString(),
          }
        }
      )
  
      res.status(200).json({ success: true, message: 'Password changed successfully.' })
    } else {
      res.status(422).json({ success: true, message: 'Email verification is failed.' })
    }
  } catch (error) {
    console.error(error);
    res.status(400).send({ success: false, message: "Password: something went wrong..." });
  }
}