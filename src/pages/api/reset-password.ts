import { DB_NAME, IUser, IVerificationToken } from "@/constants/database";
import connectToDatabase from "@/lib/clientDB";
import { Collections } from "@/constants/database";
import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import bcrypt from 'bcrypt';
import {
  generateResetToken,
  getResetTokenInfo,
  getTokenExpireDate,
  validatePassword,
  validationToken
} from "@/lib/utils";
import { ObjectId } from "mongodb";
import { sendEmail } from "@/utils/email";

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const { email } = req.body
    const header = req.headers;

    try {
      const { client, db } = await connectToDatabase();
      const collection = db.collection<IUser>(Collections.User);
      const user = await collection.findOne({ email: email });
      if (!user) {
        client.close();
        res.status(400).json({ success: false, message: 'User not found!' });
        return;
      }

      const tokenUser = { id: user?._id.toString(), ...user } as IUser;
      const encryptToken = generateResetToken(tokenUser);
      const expire = getTokenExpireDate();

      // If user exists, have to delete one
      await db.collection(Collections.VerificationToken).findOneAndDelete({
        identifier: user?._id.toString() ?? "",
      });

      // Insert new one
      await db.collection(Collections.VerificationToken).insertOne({
        identifier: user?._id.toString() ?? "",
        token: encryptToken,
        expires: expire,
      });
      client.close();

      // Send reset password email when user are in forgot password
      const link = `${header.origin}/reset-password/${encryptToken}`;
      const result = await sendEmail({
        emailType: "reset", 
        data: {
          to: email,
          action_url: link,
          support_url: `${header.origin}/contact`,
          operating_system: header["sec-ch-ua-platform"]?.toString(),
          browser_name: header["user-agent"],
        }
      })

      if (result.success) {
        // Success response
        res.status(200).json({ success: true, message: "Reset password email sent successfully." });
      } else {
        res.status(422).json(result);
      }
    } catch (error) {
      res.status(400).json({ success: false, message: 'Something went wrong.' });
    }
  } else if (req.method === "PUT") {
    const { token, newPass } = req.body;

    if (!newPass || !validatePassword(newPass)) {
      res.status(422).json({ success: false, message: "At least 8 characters. Must have a combination of uppercase letters, lowercase letters, numbers, and symbols." })
      return;
    }

    try {
      const tokenInfo = getResetTokenInfo(token);

      const { client, db } = await connectToDatabase();
      const collection = db.collection<IUser>(Collections.User);
      const user = await collection.findOne({ _id: new ObjectId(tokenInfo.userId) });

      if (!user) {
        client.close();
        res.status(400).json({ success: false, message: 'User not found!' });
        return;
      }
      
      const tokenUser = { id: user?._id.toString(), ...user } as IUser;
      const validation = validationToken(token, tokenUser);
      if (!validation) {
        client.close();
        res.status(400).json({ success: false, message: 'Expired token!' });
        return;
      }

      // Get hashed new passowrd and update
      const hashedPassword = await bcrypt.hash(newPass, 10);
      await collection.updateOne(
        { _id: user?._id },
        {
          $set: {
            password: hashedPassword,
            updatedAt: new Date().toISOString(),
          }
        }
      )

      client.close();
      // Success response
      res
        .status(200)
        .json({ success: true, message: 'Password is reset successfuly' });
    } catch (error) {
      res.status(400).json({ success: false, message: 'Something went wrong...' });
    }
  } else {
    res.status(400).json({ success: false, message: 'Bad request' });
  }
}