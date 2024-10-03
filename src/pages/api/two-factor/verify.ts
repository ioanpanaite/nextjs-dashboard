import corsMiddleware from "@/cors";
import type { NextApiRequest, NextApiResponse } from "next";
import { FRIEND_NAME, VerifyFactor, accountSid, authToken, entitieId, serviceId } from "@/constants/twilio";
import connectToDatabase from "@/lib/clientDB";
import { Collections, Status } from "@/constants/database";

const twilioClient = require('twilio')(accountSid, authToken);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  await corsMiddleware(req, res);

  const { factorSid, challengeSid, entityIdentity, code, email } = req.body

  try {
    let factorStatus = "initial"
    if (challengeSid) {
      const challenge = await twilioClient.verify.v2.services(serviceId)
        .entities(entityIdentity)
        .challenges(challengeSid)
        .update({ authPayload: code })

      factorStatus = challenge.status === Status.APPROVED ? Status.VERIFIED : challenge.status;
    } else {
      const factor = await twilioClient.verify.v2.services(serviceId)
        .entities(entityIdentity)
        .factors(factorSid)
        .update({ authPayload: code })
        
      factorStatus = factor.status;
    }

    const { client, db } = await connectToDatabase();
    const collection = db.collection(Collections.User);

    // Check existing user by email
    const currentUser = await collection.findOne({ email: email });
    if (!currentUser) {
      client.close();
      res.status(422).json({ success: false, message: "Invalid user." })
      return;
    }

    if (factorStatus === Status.VERIFIED) {
      await db.collection(Collections.TwoFactor).updateOne(
        { userId: currentUser?._id.toString() },
        {
          $set: {
            twofactorStatus: factorStatus,
            updatedAt: new Date().toISOString(),
          }
        }
      )

      res.status(200).json({ success: true, message: "Verified successfully." });
    } else {
      res.status(200).json({ success: false, message: "You went something wrong. please check your authentication app." });
    }

  } catch (error) {
    console.error(error);
    res.status(400).send({ success: false, message: "Two-Factor: Verification expired!" });
  }
}