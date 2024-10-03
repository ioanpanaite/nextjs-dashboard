import connectToDatabase from "@/lib/clientDB";
import { NextApiRequest, NextApiResponse } from "next/types";
import bcrypt from "bcrypt";
import { Collections, Status } from "@/constants/database";
import { VERIFY_SENDER } from "@/utils/email";
import { accountSid, authToken, serviceId } from "@/constants/twilio";
import { validatePassword } from '@/lib/utils';

const twilioClient = require('twilio')(accountSid, authToken);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  if (req.method !== "POST") {
    res.status(405).send('Not correct request type')
  }

  const { fullname, username, email, password } = req.body;

  if (!email || !email.includes('@')) {
    res.status(422).json({ success: false, message: "Invalid email input." })
    return;
  } else if (!password || !validatePassword(password)) {
    res.status(422).json({ success: false, message: "At least 8 characters. Must have a combination of uppercase letters, lowercase letters, numbers, and symbols." })
    return;
  }

  try {
    const { client, db } = await connectToDatabase();

    // Check existing user by email
    const existingUser = await db.collection(Collections.User).findOne({ email: email });
    if (existingUser) {
      client.close();
      res.status(422).json({ success: false, message: "User is already existing." })
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const timeAt = new Date().toISOString();

    const emailVerify = await twilioClient.verify.v2.services(serviceId)
      .verifications
      .create({
        channelConfiguration: {
          template_id: process.env.SENDGRID_EMAIL_VERIFY,
          from: VERIFY_SENDER
        }, to: email, channel: 'email'
      })

    // Set user
    const user = await db.collection(Collections.User).insertOne({
      fullname: fullname,
      username: username,
      email: email,
      password: hashedPassword,
      status: Status.PENDING,
      emailVerified: false,
      emailSid: emailVerify.sid,
      twofactorEnabled: false,
      createdAt: timeAt,
      updatedAt: timeAt,
    })

    client.close();
    res.status(200).json({ success: true, message: 'User created successfully!' });

  } catch (error) {
    console.log(error)
    res.status(422).json({ success: false, message: "Sign up API server is failed." });
  }
}