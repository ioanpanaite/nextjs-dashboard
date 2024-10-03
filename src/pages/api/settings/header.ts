import type { NextApiRequest, NextApiResponse } from "next";
import connectToDatabase from "@/lib/clientDB";
import { Collections } from "@/constants/database";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  try {
    const { client, db } = await connectToDatabase();
    const siteSettings = await db.collection(Collections.SiteSettings).findOne({});
    const advertise = await db.collection(Collections.Advertisement).find({}).sort('sort').toArray();

    client.close();
    res.status(200).json({ success: true, navData: { site: siteSettings, advertise: advertise } });
  } catch (error) {
    console.error(error);
    res.status(400).send({ success: false, message: "Email: something went wrong..." });
  }
}