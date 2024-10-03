import axios, { isAxiosError } from "axios";
import type { NextApiRequest, NextApiResponse } from "next";
import memcache from "memory-cache";
import corsMiddleware from "@/cors";

const FEAR_AND_GREED_CACHE_KEY = "FEAR_AND_GREED_CACHE_KEY";
const CACHE_TTL = 1 * 60 * 60 * 1000; // 1h
const ALTERNATIVE_ME_API_URL = process.env.ALTERNATIVE_ME_API_URL as string;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<number | string | unknown>
) {
  await corsMiddleware(req, res);
  
  const cachedValue = memcache.get(FEAR_AND_GREED_CACHE_KEY);
  if (cachedValue) {
    console.log("RETURNING FEAR AND GREED FROM CACHE");
    res.status(200).json(cachedValue);
  } else {
    try {
      const { data } = await axios.get(`${ALTERNATIVE_ME_API_URL}/fng/`, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      const output = parseInt(data.data[0].value);

      console.log("WRITING FEAR AND GREED TO CACHE");
      memcache.put(FEAR_AND_GREED_CACHE_KEY, output, CACHE_TTL);

      res.status(200).json(output);
    } catch (e) {
      if (isAxiosError(e)) {
        console.log("%ERROR%", e.response?.data);
        res
          .status((<any>e).response?.status)
          .send(e.response?.data.message || e.response?.data.error_description);
      } else if (e instanceof Error) {
        res.status(400).send(e.message);
      } else {
        res.status(400).send(e);
      }
    }
  }
}
