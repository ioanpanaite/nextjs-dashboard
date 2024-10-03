import corsMiddleware from "@/cors";
import type { NextApiRequest, NextApiResponse } from "next";
import connectToDatabase from "@/lib/clientDB";
import { Collections, IUser, LoginType, Status } from "@/constants/database";
import { sendEmail } from "@/utils/email";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  await corsMiddleware(req, res);

  const { email } = req.body

  try {
    const { client, db } = await connectToDatabase();
    const collection = db.collection(Collections.User);

    // Check existing user by email
    const currentUser = await collection.findOne({ email: email });
    if (!currentUser) {
      
      // Send email to customer to confirm code
      const code = makeCode();
      const result = await sendEmail({
        emailType: "confirm", 
        sendTo: email,
        data: {
          twilio_code: code
        }
      })
      if (result.success) {
        await collection.insertOne({ 
          email, 
          status: Status.NEW, 
          confirmCode: code,
          loginType: LoginType.CREDENTIAL,
          updatedAt: new Date().toISOString(), 
          createdAt: new Date().toISOString() 
        })
      }

      client.close();
      res.status(200).json({ success: true, info: false })
      return;
    } else if (currentUser.status === Status.NEW) {
      const result = await sendEmail({
        emailType: "confirm", 
        sendTo: email,
        data: {
          twilio_code: currentUser.confirmCode
        }
      })
      
      client.close();
      res.status(200).json({ success: true, info: false })
      return;
    }

    if (currentUser.loginType !== LoginType.CREDENTIAL) {
      const siteSettings = await db.collection(Collections.SiteSettings).findOne({});
      client.close();
      res.status(200).json({ success: true, info: false, message: siteSettings?.credential_warning })
      return;
    }

    const info = {
      fullname: currentUser.fullname,
      username: currentUser.username,
      email: currentUser.email,
      lookupKey: currentUser.lookupKey,
    }

    res.status(200).json({ success: true, info })
  } catch (error) {
    console.error(error);
    res.status(400).send({ success: false, message: "Profile info: something went wrong..." });
  }
}

function makeCode() {
  let result = '';
  const characters = 'abcdefghijklmnopqrstuvwxyz';
  const charactersLength = characters.length;

  for (let i = 0; i < 4; i++) {
    for (let counter = 0; counter < 5; counter++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    if (i < 3) result += '-';
  }
  return result;
}