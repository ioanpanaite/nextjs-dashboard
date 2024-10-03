import corsMiddleware from "@/cors";
import type { NextApiRequest, NextApiResponse } from "next";
import { FRIEND_NAME, NewFactor, accountSid, authToken, entitieId, serviceId } from "@/constants/twilio";
import QRCode from 'qrcode'
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

    await db.collection(Collections.TwoFactor).deleteOne({ userId: currentUser._id.toString() });    
    
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

    const timeAt = (new Date()).toISOString();
    await db.collection(Collections.TwoFactor).insertOne({
      userId: currentUser._id.toString(),
      twofactorSid: newFactor.sid,
      twofactorChallengeSid: "",
      entityIdentity: entity.identity,
      twofactorStatus: newFactor.status,
      twofactorQrcode: newFactor.binding.uri,
      createdAt: timeAt,
      updatedAt: timeAt
    })
    
    // Generate qrcode from factor uri
    const qrcode = await QRCode.toDataURL(newFactor.binding.uri)
      
    const twoFactor = {
      factorSid: newFactor.sid,
      challengeSid: null,
      entityIdentity: entity.identity,
      status: newFactor.status,
      qrcode: qrcode // Will set qr code image
    }

    res.status(200).json({ success: true, info: twoFactor, message: "Created new factor successfully."});
  } catch (error) {
    console.error(error);
    res.status(400).send({ success: false, message: "Two-Factor New: something went wrong..." });
  }
}