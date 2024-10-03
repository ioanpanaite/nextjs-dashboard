import axios, { isAxiosError } from "axios";
import type { NextApiRequest, NextApiResponse } from "next";
import memcache from "memory-cache";
import { ICMCCoinData, exceptTokens } from "@/constants/coin";
import corsMiddleware from "@/cors";

const CMC_COIN_LIST_CACHE_KEY = "CMC_COIN_LIST_CACHE_KEY";
const CACHE_TTL = 10 * 24 * 60 * 60 * 1000; // 10 days
const CMC_API_URL = process.env.CMC_API_URL as string;
const CMC_API_KEY = process.env.CMC_API_KEY;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ICMCCoinData[] | string | unknown>
) {
  await corsMiddleware(req, res);
  const cachedCMCCoinData = memcache.get(CMC_COIN_LIST_CACHE_KEY);
  if (cachedCMCCoinData) {
    console.log("RETURNING CMC COIN INFO FROM CACHE");
    res.status(200).json(cachedCMCCoinData);
  } else {
    try {
      const { data } = await axios.get(`${CMC_API_URL}/v1/cryptocurrency/listings/latest`, {
        headers: {
          "X-CMC_PRO_API_KEY": CMC_API_KEY,
        },
      });

      const allCoins: ICMCCoinData[] = data.data.map((coin: any) => ({
        cmc_id: coin.id,
        name: coin.name,
        symbol: coin.symbol,
      }));

      const output = allCoins.filter(coin => !exceptTokens.find(val => val.cmc_id === Number(coin.cmc_id)))
      
      console.log("WRITING CMC COIN INFO TO CACHE");
      memcache.put(CMC_COIN_LIST_CACHE_KEY, output, CACHE_TTL);

      res.status(200).json(output);
    } catch (e) {
      if (isAxiosError(e)) {
        console.log("ERROR", e.response?.data);
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
