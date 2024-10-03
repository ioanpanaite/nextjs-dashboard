import { CoinPairSymbol, ISymbolData } from "@/constants/coin";
import { isObjectNotArray } from "@/lib/utils";
import { mapValues } from "lodash";
import { useEffect, useState } from "react";

type SymbolDataType = {
  [key in CoinPairSymbol]?: {
    chanId?: number;
    data?: ISymbolData;
  };
};

export const useBitFinexStream = (symbols: string[]) => {
  const [symbolData, setSymbolData] = useState<SymbolDataType>(
    {} as SymbolDataType
  );

  useEffect(() => {
    console.log("Subscribing to WS");
    const webSocketURL = process.env.BITFINEX_WS_ENDPOINT;
    let previousSymbolData = symbolData;

    try {
      const socket = new WebSocket(`${webSocketURL}`);

      socket.addEventListener("open", (event) => {
        for (const symbol of symbols) {
          const request = JSON.stringify({
            event: "subscribe",
            channel: "ticker",
            symbol: symbol,
          });

          socket.send(request);
        }
      });

      socket.addEventListener("message", (event) => {
        let latestSymbolData: SymbolDataType;

        const jsonData = JSON.parse(event.data);
        if (isObjectNotArray(jsonData) && jsonData.event === "subscribed") {
          const { chanId, symbol } = jsonData;
          latestSymbolData = {
            ...previousSymbolData,
            [symbol as CoinPairSymbol]: { chanId },
          };

          previousSymbolData = latestSymbolData;
          setSymbolData(latestSymbolData);
        } else if (Array.isArray(jsonData)) {
          const [chanId, newSymbolData] = jsonData;

          if (Array.isArray(newSymbolData)) {
            latestSymbolData = mapValues(previousSymbolData, (v) => {
              if (v?.chanId === chanId) {
                const [
                  BID,
                  BID_SIZE,
                  ASK,
                  ASK_SIZE,
                  DAILY_CHANGE,
                  DAILY_CHANGE_RELATIVE,
                  LAST_PRICE,
                  VOLUME,
                  HIGH,
                  LOW,
                ] = newSymbolData as number[];

                return {
                  ...v,
                  data: {
                    price: LAST_PRICE,
                    dailyChange: DAILY_CHANGE,
                    dailyChangePercent: DAILY_CHANGE_RELATIVE,
                  } as ISymbolData,
                };
              }

              return v;
            });

            previousSymbolData = latestSymbolData;
            setSymbolData(latestSymbolData);
          }
        }
      });

      socket.addEventListener("close", (event) => {
        console.error("WebSocket connection closed:", event);
      });

      return () => {
        if (socket) {
          console.log("closing existing WS connection");
          socket.close();
        }
      };
    } catch (e) {
      console.error(`Connection to ${webSocketURL} failed!`);
      console.error(e);
    }
  }, [symbols, symbolData]);

  return symbolData;
};
