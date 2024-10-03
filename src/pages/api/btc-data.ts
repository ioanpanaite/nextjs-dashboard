import axios, { isAxiosError } from "axios";
import type { NextApiRequest, NextApiResponse } from "next";
import memcache from "memory-cache";
import corsMiddleware from "@/cors";

const BTC_DATA_CACHE_KEY = "BTC_DATA_CACHE_KEY";
const oneHour = 1 * 60 * 60 * 1000;

const ALL_COIN_DATA_ENDPOINT =
  "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&page=1&sparkline=false";

const BTC_DATA_ENDPOINT =
  "https://api.coingecko.com/api/v3/coins/bitcoin?tickers=false&market_data=true&community_data=false&developer_data=false";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  await corsMiddleware(req, res);
  const cachedBTCData = memcache.get(BTC_DATA_CACHE_KEY);
  if (cachedBTCData) {
    console.log("RETURNING BTC DATA FROM CACHE");
    res.status(200).json(cachedBTCData);
  } else {
    try {
      const [{ data: allCoinData }, { data: btcData }]: [any, any] =
        await Promise.all([
          axios.get(ALL_COIN_DATA_ENDPOINT),
          axios.get(BTC_DATA_ENDPOINT),
        ]);

      const ethData = allCoinData.find(
        ({ id }: { id: string }) => id === "ethereum"
      );
      const ethMarketCap = ethData["market_cap"];

      const globalMarketCap = allCoinData.reduce((acc: number, coin: any) => {
        return acc + coin["market_cap"];
      }, 0);

      const btcMarketCap = btcData["market_data"]["market_cap"]["usd"];
      const btcDominance = (btcMarketCap / globalMarketCap) * 100;
      const ethDominance = (ethMarketCap / globalMarketCap) * 100;

      const btcPriceChangePercentDaily =
        btcData["market_data"]["price_change_percentage_24h"];
      const btcPriceChangePercentWeekly =
        btcData["market_data"]["price_change_percentage_7d"];
      const btcPriceChangePercentMonthly =
        btcData["market_data"]["price_change_percentage_30d"];
      const btcPriceChangePercentYearly =
        btcData["market_data"]["price_change_percentage_1y"];

      const output = {
        globalMarketCap,
        btcMarketCap,
        btcDominance,
        ethDominance,
        btcPriceChangePercentDaily,
        btcPriceChangePercentWeekly,
        btcPriceChangePercentMonthly,
        btcPriceChangePercentYearly,
      };

      console.log("WRITING BTC DATA TO CACHE");
      memcache.put(BTC_DATA_CACHE_KEY, output, oneHour);

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
