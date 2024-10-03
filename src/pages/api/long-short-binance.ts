import type { NextApiRequest, NextApiResponse } from "next";
import memcache from "memory-cache";
import axios, { isAxiosError } from "axios";
import { IBinanceLongShortData } from "@/constants/coin";
import corsMiddleware from "@/cors";

const LONG_SHORT_BINANCE_CACHE_KEY = "LONG_SHORT_BINANCE_CACHE_KEY";
const CACHE_TTL = 1 * 60 * 1000; // 1min
const BINANCE_REST_ENDPOINT = process.env.BINANCE_REST_ENDPOINT as string;
const LONG_SHORT_WINDOW_SIZE = "1d";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<IBinanceLongShortData | string | unknown>
) {
  await corsMiddleware(req, res);
  const { period } = req.query;
  const BINANACE_PERIOD = period ? period : LONG_SHORT_WINDOW_SIZE
  const cachedValue = memcache.get(`${BINANACE_PERIOD}:${LONG_SHORT_BINANCE_CACHE_KEY}`);

  if (cachedValue) {
    console.log("RETURNING BINANCE LONG/SHORT FROM CACHE");
    res.status(200).json(cachedValue);
  } else {
    try {
      const { data: topTradersData } = await axios.get(
        `${BINANCE_REST_ENDPOINT}/futures/data/topLongShortPositionRatio`,
        {
          params: {
            symbol: "BTCUSDT",
            period: BINANACE_PERIOD,
          },
        }
      );
      const { data: retailData } = await axios.get(
        `${BINANCE_REST_ENDPOINT}/futures/data/globalLongShortAccountRatio`,
        {
          params: {
            symbol: "BTCUSDT",
            period: BINANACE_PERIOD,
          },
        }
      );

      const output = {
        topTraders: topTradersData[topTradersData.length - 1],
        retail: retailData[retailData.length - 1],
      };

      console.log("WRITING BINANCE LONG/SHORT TO CACHE");
      memcache.put(`${BINANACE_PERIOD}:${LONG_SHORT_BINANCE_CACHE_KEY}`, output, CACHE_TTL);

      res.status(200).json(output);
    } catch (e) {
      if (isAxiosError(e)) {
        console.log("ERROR", e.response?.data);
        res
          .status((<any>e).response?.status)
          .send(
            e.response?.data.message ||
              e.response?.data.error_description ||
              e.response?.data
          );
      } else if (e instanceof Error) {
        res.status(400).send(e.message);
      } else {
        res.status(400).send(e);
      }
    }
  }
}
