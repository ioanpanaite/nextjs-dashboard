import type { NextApiRequest, NextApiResponse } from "next";
import connectToDatabase from "@/lib/clientDB";
import { Collections, Status } from "@/constants/database";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  try {
    const session = await getServerSession(req, res, authOptions)
    const email = session?.user?.email
    if (email) {
      const { client, db } = await connectToDatabase();

      // Check existing user by email
      const currentUser = await db.collection(Collections.User).findOne({ email: email });
      if (!currentUser) {
        client.close();
        res.status(422).json({ success: false, message: "Invalid user." })
        return;
      }

      if (!currentUser.promoCode || currentUser.lookupKey) {
        client.close();
        res.status(200).json({ success: true, info: { isPromo: false } })
        return;
      }

      const promoCode = await db.collection(Collections.PromoCode).findOne({ promoCode: currentUser.promoCode })
      if (!promoCode) {
        client.close();
        res.status(422).json({ success: false, message: "Invalid promo code." })
        return;
      }

      let isExpried = false
      const createdAt = new Date(currentUser.createdAt).getTime()
      const currentTime = new Date().getTime()

      if (promoCode.promoPeriod === '1day') {
        const limitTime = createdAt + (1 * 24 * 60 * 60 * 1000)
        isExpried = (currentTime > limitTime) ? true : false
      } else if (promoCode.promoPeriod === '1week') {
        const limitTime = createdAt + (7 * 24 * 60 * 60 * 1000)
        isExpried = (currentTime > limitTime) ? true : false
      } else if (promoCode.promoPeriod === '2weeks') {
        const limitTime = createdAt + (14 * 24 * 60 * 60 * 1000)
        isExpried = (currentTime > limitTime) ? true : false
      } else if (promoCode.promoPeriod === '1month') {
        const limitTime = createdAt + (30 * 24 * 60 * 60 * 1000)
        isExpried = (currentTime > limitTime) ? true : false
      } else if (promoCode.promoPeriod === '3months') {
        const limitTime = createdAt + (3 * 30 * 24 * 60 * 60 * 1000)
        isExpried = (currentTime > limitTime) ? true : false
      } else if (promoCode.promoPeriod === '6months') {
        const limitTime = createdAt + (6 * 30 * 24 * 60 * 60 * 1000)
        isExpried = (currentTime > limitTime) ? true : false
      }

      const siteSettings = await db.collection(Collections.SiteSettings).findOne({});
      if (isExpried) {
        const result = await db.collection(Collections.User).updateOne(
          { email: email },
          { $set: { status: Status.EXPIRED } }
        );
      }

      client.close();
      res.status(200).json({ success: true, info: { isPromo: true, isExpired: isExpried, message: siteSettings?.code_expired } })
    }
    res.end();
  } catch (error) {
    console.error(error);
    res.status(400).send({ success: false, message: "Email: something went wrong..." });
  }
}