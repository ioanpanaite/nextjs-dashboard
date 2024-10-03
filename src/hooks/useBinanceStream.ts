import { WebsocketConnection } from "@/lib/WebSocketConnection";
import { difference, uniq } from "lodash";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

interface BinanceStreamData {
  [k: string]: any;
}

const BINANCE_WS_URL = `${process.env.BINANCE_WS_ENDPOINT}/ws`;

export const useBinanceStream = <T>(
  streams: { [symbol: string]: string } | undefined,
  dataTransformer: (data: any) => T
) => {
  const [data, setData] = useState<BinanceStreamData>();
  const socketRef = useRef<WebsocketConnection>();
  const prevStreamsRef = useRef<string[]>([]);

  const sendSubscribeMessage = useCallback((streamsToSubscribe: string[]) => {
    if (!streamsToSubscribe?.length) {
      console.log("no streams to subscribe");
      return;
    }

    console.log("subscribe", streamsToSubscribe);
    socketRef.current?.send({
      id: Math.floor(Math.random() * 1000000),
      method: "SUBSCRIBE",
      params: streamsToSubscribe,
      combined: true,
    });
  }, []);

  const uniqStreams = useMemo(() => {
    if (!streams) return [];

    return uniq(Object.values(streams));
  }, [streams]);

  useEffect(() => {
    if (socketRef.current || !uniqStreams?.length) {
      return;
    }

    prevStreamsRef.current = uniqStreams;

    let latestData: BinanceStreamData = {};
    let lastMessageTimer: NodeJS.Timeout | undefined;

    const startMessageTimer = () => {
      lastMessageTimer = setTimeout(() => {
        console.log("STOPPED RECEIVING MESSAGES");

        if (socketRef.current?.isConnected()) {
          socketRef.current.close();
        }

        socketRef.current = new WebsocketConnection(
          BINANCE_WS_URL,
          onMessage,
          onOpen
        );
      }, 3000);
    };

    console.log("connect to ws stream");

    const onOpen = () => {
      sendSubscribeMessage(prevStreamsRef.current);

      startMessageTimer();
    };

    const onMessage = (rawData: string) => {
      const data = JSON.parse(rawData);

      if (data.s) {
        const temp: BinanceStreamData = {
          ...latestData,
          [data.s]: dataTransformer(data),
        };

        latestData = temp;
        setData(temp);

        if (lastMessageTimer) {
          clearTimeout(lastMessageTimer);
          lastMessageTimer = undefined;

          startMessageTimer();
        }
      }
    };

    socketRef.current = new WebsocketConnection(
      BINANCE_WS_URL,
      onMessage,
      onOpen
    );

    // return () => {
    //   console.log("CLOSE CONNECTION");
    //   socketRef.current?.close();
    //   socketRef.current = undefined;
    // };
  }, [dataTransformer, sendSubscribeMessage, uniqStreams]);

  useEffect(() => {
    if (socketRef.current?.isConnected() && uniqStreams) {
      const unsubscribeStreams = difference(
        prevStreamsRef.current,
        uniqStreams
      );

      const subscribeStreams = difference(uniqStreams, prevStreamsRef.current);

      prevStreamsRef.current = uniqStreams;

      if (!unsubscribeStreams.length && !subscribeStreams.length) {
        return;
      }

      if (unsubscribeStreams.length) {
        console.log("unsubscribe", unsubscribeStreams);
        socketRef.current.send({
          id: 2,
          method: "UNSUBSCRIBE",
          params: unsubscribeStreams,
          combined: true,
        });
      }
      if (subscribeStreams.length) {
        sendSubscribeMessage(subscribeStreams);
      }
    }
  }, [sendSubscribeMessage, uniqStreams]);

  return data;
};
