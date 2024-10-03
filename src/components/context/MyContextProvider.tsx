import { IBinanceAssetData, ICMCCoinData } from "@/constants/coin";
import axios from "axios";
import React, {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useEffect,
  useState,
} from "react";

interface IDataContextProps {
  binanceAssets: IBinanceAssetData[];
  setBinanceAssets: Dispatch<SetStateAction<IBinanceAssetData[]>>;
  cmcCoinData: ICMCCoinData[];
  setCmcCoinData: Dispatch<SetStateAction<ICMCCoinData[]>>;
}

const MyContext = createContext<IDataContextProps>({
  binanceAssets: [],
  setBinanceAssets: () => { },
  cmcCoinData: [],
  setCmcCoinData: () => { },
});

const MyContextProvider = ({ children }: { children: ReactNode }) => {
  const [binanceAssets, setBinanceAssets] = useState<IBinanceAssetData[]>([]);
  const [cmcCoinData, setCmcCoinData] = useState<ICMCCoinData[]>([]);

  useEffect(() => {
    // axios
    //   .get("/api/binance-symbols")
    //   .then(({ data }) => setBinanceAssets(data));

    axios.get("/api/cmc-coin-list").then(({ data }) => setCmcCoinData(data));
  }, []);

  return (
    <MyContext.Provider
      value={{ binanceAssets, setBinanceAssets, cmcCoinData, setCmcCoinData }}
    >
      {children}
    </MyContext.Provider>
  );
};

export { MyContext, MyContextProvider };
