import corsMiddleware from "@/cors";
import type { NextApiRequest, NextApiResponse } from "next";
import { sendEmail } from "@/utils/email";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  await corsMiddleware(req, res);

  const { emailType, data } = req.body

  try {
    const result = await sendEmail({ emailType, data })

    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(422).json(result);
    }
  } catch (error) {
    console.error(error);
    res.status(400).send({ success: false, message: "Email: something went wrong..." });
  }
}