import { dateStringToTimestamp, getDateAWeekAgo, getDatePeriodAgo } from "@/lib/utils";
import axios, { isAxiosError } from "axios";
import type { NextApiRequest, NextApiResponse } from "next";
import memcache from "memory-cache";
import { chain, orderBy } from "lodash";
import { IUSDIndexData } from "@/constants/coin";
import corsMiddleware from "@/cors";
import { usdPeriods } from "@/constants/periods";

const USD_INDEX_DATA_CACHE_KEY = "USD_INDEX_DATA_CACHE_KEY";

const cache_TTL = 60 * 60 * 1000; // 1 hour as quote is 2000 calls per month
const FUTURES_API_URL = process.env.FUTURES_API_URL;
const FUTURES_API_KEY = process.env.FUTURES_API_KEY;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<IUSDIndexData | string | unknown>
) {
  await corsMiddleware(req, res);
  const { period } = req.query
  const cachedUSDIndexData = memcache.get(`${period}:${USD_INDEX_DATA_CACHE_KEY}`);
  if (cachedUSDIndexData) {
    console.log("RETURNING USD INDEX DATA FROM CACHE");
    res.status(200).json(cachedUSDIndexData);
  } else {
    try {
      const { data: lastData } = await axios.get(
        `${FUTURES_API_URL}/last` as string,
        {
          params: { symbol: "DX" },
          headers: {
            "x-api-key": FUTURES_API_KEY,
          },
        }
      );

      const lastAvailableDate = lastData.data[0].date;
      const lastAvailablePrice = lastData.data[0].last;
      
      let weekAgoDate = getDateAWeekAgo(lastAvailableDate);
      if (period === usdPeriods[0].value) {
        weekAgoDate = getDateAWeekAgo(lastAvailableDate);
      } else if (period === usdPeriods[1].value) {
        weekAgoDate = getDatePeriodAgo(lastAvailableDate, 14);
      } else if (period === usdPeriods[2].value) {
        weekAgoDate = getDatePeriodAgo(lastAvailableDate, 30);
      } else if (period === usdPeriods[3].value) {
        weekAgoDate = getDatePeriodAgo(lastAvailableDate, 90);
      } else if (period === usdPeriods[4].value) {
        weekAgoDate = getDatePeriodAgo(lastAvailableDate, 180);
      }

      const { data: seriesData } = await axios.get(
        `${FUTURES_API_URL}/time-series` as string,
        {
          params: { symbol: "DX", from: weekAgoDate },
          headers: {
            "x-api-key": FUTURES_API_KEY,
          },
        }
      );

      const transformedSeries = chain(seriesData.data)
        .groupBy("date")
        .mapValues(
          (particularDateData) =>
            orderBy(particularDateData, "month", "desc")[0]
        )
        .values()
        .value();

      const d1Change = transformedSeries[0].last - transformedSeries[1].last;
      const d1ChangePercent = (
        (d1Change / transformedSeries[1].last) *
        100
      ).toFixed(2);
      const w1Change =
        transformedSeries[0].last -
        transformedSeries[transformedSeries.length - 1].last;
      const w1ChangePercent = (
        (w1Change / transformedSeries[transformedSeries.length - 1].last) *
        100
      ).toFixed(2);

      const output = {
        lastValue: transformedSeries[0].last,
        d1ChangePercent: Number(d1ChangePercent),
        w1ChangePercent: Number(w1ChangePercent),
        series: transformedSeries.map((item: any) => ({
          t: dateStringToTimestamp(item.date),
          v: item.last,
        })),
      };

      console.log("WRITING USD INDEX DATA TO CACHE");
      memcache.put(`${period}:${USD_INDEX_DATA_CACHE_KEY}`, output, cache_TTL);

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
