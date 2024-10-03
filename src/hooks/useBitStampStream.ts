import { WebsocketConnection } from "@/lib/WebSocketConnection";
import { useEffect, useState } from "react";

export const useBitStampStream = (channel: string) => {
  const [data, setData] = useState();

  useEffect(() => {
    const socket = new WebsocketConnection(
      `${process.env.BITSTAMP_WS_ENDPOINT}`,
      (data) => setData(data),
      (socket, e) => {
        const request = JSON.stringify({
          event: "bts:subscribe",
          data: {
            channel: "live_trades_btcusd",
          },
        });
        console.log(request);
        socket?.send(request);
      }
    );
  }, []);

  return [data];
};
