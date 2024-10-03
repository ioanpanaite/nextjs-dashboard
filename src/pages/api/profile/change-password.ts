import corsMiddleware from "@/cors";
import type { NextApiRequest, NextApiResponse } from "next";
import connectToDatabase from "@/lib/clientDB";
import { Collections, Status } from "@/constants/database";
import bcrypt from 'bcrypt';
import { validatePassword } from "@/lib/utils";
import { accountSid, authToken, serviceId } from "@/constants/twilio";
import { VERIFY_SENDER } from "@/utils/email";
const twilioClient = require('twilio')(accountSid, authToken);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  await corsMiddleware(req, res);

  const { currentUserEmail, currentPass, newPass } = req.body

  if (!newPass || !validatePassword(newPass)) {
    res.status(422).json({ success: false, message: "At least 8 characters. Must have a combination of uppercase letters, lowercase letters, numbers, and symbols." })
    return;
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

    const isValid = await bcrypt.compare(currentPass, currentUser.password)
    if (!isValid) {
      client.close();
      res.status(422).json({ success: false, message: "Invalid current password." })
      return;
    }

    const emailVerify = await twilioClient.verify.v2.services(serviceId)
      .verifications
      .create({
        channelConfiguration: {
          template_id: process.env.SENDGRID_EMAIL_VERIFY,
          from: VERIFY_SENDER
        }, to: currentUserEmail, channel: 'email'
      })

    if (emailVerify.status === Status.PENDING) {
      // Get hashed new passowrd and update
      const hashedPassword = await bcrypt.hash(newPass, 10);
      await collection.updateOne(
        { _id: currentUser?._id },
        {
          $set: {
            passwordVerify: false,
            passwordNew: hashedPassword,
            updatedAt: new Date().toISOString(),
          }
        }
      )
      res.status(200).json({ success: true, message: 'Email verification code sent. Please verify code.' })
    } else {
      res.status(422).json({ success: false, message: 'Email verification API is failed.' })
    }

  } catch (error) {
    console.error(error);
    res.status(400).send({ success: false, message: "Password: something went wrong..." });
  }
}