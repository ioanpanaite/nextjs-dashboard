import axios, { isAxiosError } from "axios";
import type { NextApiRequest, NextApiResponse } from "next";
import memcache from "memory-cache";
import { IBinanceAssetData } from "@/constants/coin";
import corsMiddleware from "@/cors";

const BINANCE_EXCHANGE_INFO_CACHE_KEY = "BINANCE_EXCHANGE_INFO_CACHE_KEY";
const CACHE_TTL = 10 * 24 * 60 * 60 * 1000; // 10 days

const BINANCE_REST_ENDPOINT = process.env.BINANCE_REST_ENDPOINT as string;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<IBinanceAssetData[] | string | unknown>
) {
  await corsMiddleware(req, res);
  const cachedBTCData = memcache.get(BINANCE_EXCHANGE_INFO_CACHE_KEY);
  if (cachedBTCData) {
    console.log("RETURNING BINANCE INFO CACHE");
    res.status(200).json(cachedBTCData);
  } else {
    try {
      const { data } = await axios.get(`${BINANCE_REST_ENDPOINT}/fapi/v1/exchangeInfo`);

      const output = data.symbols.reduce(
        (acc: IBinanceAssetData[], symbol: any) => {
          if (symbol.quoteAsset === "USDT") {
            return [
              ...acc,
              {
                symbol: symbol.symbol,
                baseAsset: symbol.baseAsset,
                quoteAsset: symbol.quoteAsset,
              },
            ];
          }

          return acc;
        },
        []
      );

      console.log("WRITING BINANCE INFO TO CACHE");
      memcache.put(BINANCE_EXCHANGE_INFO_CACHE_KEY, output, CACHE_TTL);

      res.status(200).json(output);
    } catch (e) {
      if (isAxiosError(e)) {
        console.log(e.response?.data);
        res
          .status((<any>e).response.status)
          .send(e.response?.data.message || e.response?.data.error_description);
      } else if (e instanceof Error) {
        res.status(400).send(e.message);
      } else {
        res.status(400).send(e);
      }
    }
  }
}
