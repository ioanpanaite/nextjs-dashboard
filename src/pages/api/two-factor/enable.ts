import corsMiddleware from "@/cors";
import type { NextApiRequest, NextApiResponse } from "next";
import { FRIEND_NAME, accountSid, authToken, entitieId, serviceId } from "@/constants/twilio";
import connectToDatabase from "@/lib/clientDB";
import { Collections } from "@/constants/database";
import { getIdentifieCode } from "@/lib/utils";

const twilioClient = require('twilio')(accountSid, authToken);

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
    // Set Enabled of user
    await db.collection(Collections.User).updateOne(
      { _id: currentUser._id },
      {
        $set: {
          twofactorEnabled: true,
          updatedAt: timeAt
        }
      }
    )

    // Check current factor
    const currentFactor = await db.collection(Collections.TwoFactor).findOne({ userId: currentUser._id.toString() });
    if (!currentFactor) {
      const identity = getIdentifieCode()
      const entity = await twilioClient.verify.v2.services(serviceId)
        .entities
        .create({ identity: identity })

      const newFactor = await twilioClient.verify.v2.services(serviceId)
        .entities(entity.identity)
        .newFactors
        .create({
          friendlyName: FRIEND_NAME,
          factorType: 'totp'
        })

      await db.collection(Collections.TwoFactor).insertOne({
        userId: currentUser._id.toString(),
        twofactorSid: newFactor.sid,
        twofactorChallengeSid: "",
        twofactorStatus: newFactor.status,
        entityIdentity: entity.identity,
        twofactorQrcode: newFactor.binding.uri,
        createdAt: timeAt,
        updatedAt: timeAt
      })
    }

    res.status(200).json({ success: true, message: "Two-Factor enabled successfully." });
  } catch (error) {
    console.error(error);
    res.status(400).send({ success: false, message: "Two-Factor: something went wrong..." });
  }
}