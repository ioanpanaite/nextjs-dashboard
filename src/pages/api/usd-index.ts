// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { getDateAWeekAgo } from "@/lib/utils";
import axios, { isAxiosError } from "axios";
import type { NextApiRequest, NextApiResponse } from "next";

const USD_INDEX_DATA_CACHE_KEY = "USD_INDEX_DATA_CACHE_KEY";

const FUTURES_API_TIME_SERIES_ENDPOINT =
  process.env.FUTURES_API_TIME_SERIES_ENDPOINT;
const FUTURES_API_LAST_ENDPOINT = process.env.FUTURES_API_LAST_ENDPOINT;
const FUTURES_API_KEY = process.env.FUTURES_API_KEY;

// /last endpoint response
// {
//     "metadata": {
//     "symbol": "DX",
//     "name": "US Dollar Index",
//     "exchange": "ICEUS",
//     "currency": "USD",
//     "contract_size": 1000,
//     "contract_unit": "index value"
//     },
//     "data": [
//     {
//     "date": "2023-02-08",
//     "symbol": "DX",
//     "month": 2,
//     "year": 2023,
//     "last": 103.35,
//     "open": null,
//     "high": null,
//     "low": null,
//     "change": 0.095,
//     "change_p": 0.0005
//     },
//     {
//     "date": "2023-02-08",
//     "symbol": "DX",
//     "month": 5,
//     "year": 2023,
//     "last": 103.015,
//     "open": null,
//     "high": null,
//     "low": null,
//     "change": -0.015,
//     "change_p": 0.0006
//     }
//     ]
//  }

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  // THIS ENDPOINT IS NOT CURRENTLY IN USE
  const weekAgoDate = getDateAWeekAgo();
  res.status(200).send(weekAgoDate);
  return;

  //   const cachedUSDIndexData = persistentCache.getSync(USD_INDEX_DATA_CACHE_KEY);
  //   if (cachedUSDIndexData) {
  //     res.status(200).json(cachedUSDIndexData);
  //   } else {
  //     try {
  //       //   const response = await axios.get(FUTURES_API_LAST_ENDPOINT as string, {
  //       //     params: { symbol: "DX" },
  //       //     headers: {
  //       //       "x-api-key": FUTURES_API_KEY,
  //       //     },
  //       //   });

  //       const response = await axios.get(
  //         FUTURES_API_TIME_SERIES_ENDPOINT as string,
  //         {
  //           params: { symbol: "DX", from: getDateAWeekAgo() },
  //           headers: {
  //             "x-api-key": FUTURES_API_KEY,
  //           },
  //         }
  //       );
  //       console.log(response.data);

  //       //persistentCache.putSync(USD_INDEX_DATA_CACHE_KEY, response.data);

  //       res.status(200).json(response.data);
  //     } catch (e) {
  //       if (isAxiosError(e)) {
  //         console.log(e.response?.data);
  //         res
  //           .status((<any>e).response.status)
  //           .send(e.response?.data.message || e.response?.data.error_description);
  //       } else if (e instanceof Error) {
  //         res.status(400).send(e.message);
  //       } else {
  //         res.status(400).send(e);
  //       }
  //     }
  //   }
}
