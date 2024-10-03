import { IBitcoinData } from "@/constants/coin";
import axios from "axios";
import { useEffect, useState } from "react";

export const useBitcoinData = () => {
  const [data, setData] = useState<IBitcoinData>();

  useEffect(() => {
    axios.get("/api/btc-data").then(({ data }) => setData(data));
  }, []);

  return data;
};
