// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { XMLParser } from "fast-xml-parser";
import type { NextApiRequest, NextApiResponse } from "next";
import memcache from "memory-cache";
import corsMiddleware from "@/cors";

const rss_feed_url = process.env.RSS_FEED_URL;
const MEM_CACHE_RSS_KEY = "MEM_CACHE_RSS_KEY";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ title: string; link: string }[]>
) {
  await corsMiddleware(req, res);
  const cachedItems = memcache.get(MEM_CACHE_RSS_KEY);
  if (cachedItems) {
    res.status(200).json(cachedItems);
  } else {
    const response = await fetch(rss_feed_url as string)
    const data = await response.text()
    const parser = new XMLParser();
    const parsedData = parser.parse(data);

    const items = parsedData.rss ? parsedData.rss.channel.item.map(
      ({ title, link }: { title: string; link: string }) => ({ title, link })
    ): [];

    memcache.put(MEM_CACHE_RSS_KEY, items, 1000 * 60 * 20);

    res.status(200).json(items);
  }
}
