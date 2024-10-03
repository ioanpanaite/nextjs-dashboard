import type { NextApiRequest, NextApiResponse } from "next";
import memcache from "memory-cache";
import { ICoinGlassShortLongData } from "@/constants/coin";
import corsMiddleware from "@/cors";
import axios from "axios";

const LONG_SHORT_COINGLASS_CACHE_KEY = "LONG_SHORT_COINGLASS_CACHE_KEY";
const CACHE_TTL = 10 * 1000; // 10s
const BYBIT_EXCHANGE_API_URL = process.env.BYBIT_EXCHANGE_API_URL as string;
const LONG_SHORT_WINDOW_SIZE = "1d";
const BAPI_API_KEY = process.env.BYBIT_EXCHANGE_API_SECRET as string;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ICoinGlassShortLongData | string | unknown>
) {
  await corsMiddleware(req, res);
  const { period } = req.query;
  const BYBIT_PERIOD = period ? period : LONG_SHORT_WINDOW_SIZE

  const cachedValue = memcache.get(`${BYBIT_PERIOD}: ${LONG_SHORT_COINGLASS_CACHE_KEY}`);
  if (cachedValue) {
    console.log("RETURNING COINGLASS LONG/SHORT FROM CACHE");
    res.status(200).json(cachedValue);
  } else {
    try {
      const host = `${BYBIT_EXCHANGE_API_URL}/v5/market/account-ratio?category=linear&symbol=BTCUSDT&period=${LONG_SHORT_WINDOW_SIZE}&limit=1`;
      const response = await axios.get(host, {
        headers: {
          "X-BAPI-SIGN": "application/xml",
          "X-BAPI-API-KEY": BAPI_API_KEY,
          "X-BAPI-TIMESTAMP": Date.now(),
          "X-BAPI-RECV-WINDOW": 5000
        },
      });
      const { data: byBitData } = response

      const output = byBitData.result ? byBitData.result.list[0]: []

      console.log("WRITING COINGLASS LONG/SHORT TO CACHE");
      memcache.put(`${BYBIT_PERIOD}: ${LONG_SHORT_COINGLASS_CACHE_KEY}`, output, CACHE_TTL);

      res.status(200).json(output);
    } catch (e) {
      if (e instanceof Error) {
        res.status(400).send(e.message);
      } else {
        res.status(400).send(e);
      }
    }
  }
}
