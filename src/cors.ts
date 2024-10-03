import Cors from "cors";
import { NextApiRequest, NextApiResponse } from "next";

// Set up the CORS options
const corsOptions = {
  origin: "https://forflies.vercel.app",
  methods: ["GET"],
};

function corsMiddleware(req: NextApiRequest, res: NextApiResponse) {
  const cors = Cors(corsOptions);

  return new Promise((resolve, reject) => {
    cors(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }

      return resolve(result);
    });
  });
}

export default corsMiddleware;
