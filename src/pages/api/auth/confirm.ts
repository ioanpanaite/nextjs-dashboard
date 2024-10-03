import corsMiddleware from "@/cors";
import type { NextApiRequest, NextApiResponse } from "next";
import connectToDatabase from "@/lib/clientDB";
import { Collections, IUser } from "@/constants/database";
import cookie from "cookie";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {

  await corsMiddleware(req, res);

  const { data } = req.body

  try {
    const { client, db } = await connectToDatabase();
    const collection = db.collection(Collections.User);

    // Check existing user by email
    const currentUser = await collection.findOne({ email: data.email });
    if (!currentUser) {
      client.close();
      res.status(420).json({ success: false, message: 'Invalid user.' })
      return;
    }

    if (currentUser.confirmCode === data.confirmCode) {
      // Set user cookie
      const aweek = 7 * 24 * 60 * 60
      const passData = { email: data.email, createdAt: (new Date()).getTime() }
      const encode = Buffer.from(JSON.stringify(passData)).toString('base64');

      const cookieSerial = cookie.serialize('profile', encode, {
        httpOnly: true,
        maxAge: aweek,
        secure: true,
        path: '/'
      })
      res.setHeader('Set-Cookie', [cookieSerial])

      res.status(200).json({ success: true, confirm: true })
    } else {
      res.status(200).json({ success: true, confirm: false })
    }
  } catch (error) {
    console.error(error);
    res.status(400).send({ success: false, message: "Profile info: something went wrong..." });
  }
}