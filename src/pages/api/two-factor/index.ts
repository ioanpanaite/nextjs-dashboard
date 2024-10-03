import corsMiddleware from "@/cors";
import type { NextApiRequest, NextApiResponse } from "next";
import connectToDatabase from "@/lib/clientDB";
import { Collections, ITwoFactor, IUser, Status } from "@/constants/database";
import QRCode from 'qrcode';
import { FRIEND_NAME, accountSid, authToken, entitieId, serviceId } from "@/constants/twilio";
import { getIdentifieCode } from "@/lib/utils";

const twilioClient = require('twilio')(accountSid, authToken);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  await corsMiddleware(req, res);

  const { email } = req.body

  try {
    // Get user collection
    const { client, db } = await connectToDatabase();
    const userCollection = db.collection(Collections.User);
    const user = await userCollection.findOne({ email: email });

    if (!user) {
      client.close();
      res.status(200).json({ success: false, message: 'Invalid user!' });
      return;
    }

    const twoCollection = db.collection<ITwoFactor>(Collections.TwoFactor);
    let twofactor = await twoCollection.findOne<ITwoFactor>({ userId: user._id.toString() });
    const identity = getIdentifieCode()
    if (!twofactor) {
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
      twofactor = {
        userId: user._id.toString(),
        twofactorSid: newFactor.sid,
        twofactorChallengeSid: "",
        entityIdentity: entity.identity,
        twofactorStatus: newFactor.status,
        twofactorQrcode: newFactor.binding.uri,
        createdAt: timeAt,
        updatedAt: timeAt
      }
      await db.collection(Collections.TwoFactor).insertOne(twofactor)
    }

    // Generate qrcode from factor uri
    const qrcode = await QRCode.toDataURL(twofactor.twofactorQrcode);

    if (twofactor.twofactorStatus === Status.VERIFIED || twofactor.twofactorStatus === Status.DISABLED) {
      const challenge = await twilioClient.verify.v2.services(serviceId)
        .entities(twofactor.entityIdentity)
        .challenges
        .create({
          factorSid: twofactor.twofactorSid
        });

      // Update verification status when user already verifed in the past
      await twoCollection.updateOne(
        { userId: user?._id.toString() },
        {
          $set: {
            twofactorChallengeSid: challenge.sid,
            twofactorStatus: challenge.status,
            updatedAt: new Date().toISOString(),
          }
        }
      )

      // Change into new challenge status
      const twoFactor = {
        factorSid: user.twofactorSid,
        challengeSid: challenge.sid,
        entityIdentity: twofactor.entityIdentity,
        status: challenge.status,
        qrcode: qrcode
      }

      res.status(200).json({ success: true, info: twoFactor });
    } else {
      const twoFactor = {
        factorSid: twofactor.twofactorSid,
        challengeSid: null,
        entityIdentity: twofactor.entityIdentity,
        status: twofactor.twofactorStatus,
        qrcode: qrcode
      }
      res.status(200).json({ success: true, info: twoFactor });
    }
  } catch (error) {
    console.error(error);
    res.status(422).send({ success: false, message: "Two-Factor: something went wrong..." });
  }
}