import Chart, { ChartPoint } from "@/widgets/chart";
import { RefObject, useEffect, useLayoutEffect, useRef, useState } from "react";

export const useChart = (
  containerRef: RefObject<HTMLDivElement>,
  pointData: ChartPoint[],
  isCandlestick = false
) => {
  const [isReady, setIsReady] = useState(false);
  const chartRef = useRef<Chart>();

  useLayoutEffect(() => {
    if (containerRef?.current && !chartRef.current) {
      chartRef.current = new Chart(containerRef.current, isCandlestick);
    }

    return () => {
      chartRef.current?.destroy();
      chartRef.current = undefined;
    };
  }, [containerRef, isCandlestick]);

  useEffect(() => {
    if (pointData.length && chartRef.current) {
      chartRef.current?.update(pointData);
      setIsReady(true);
    }
  }, [pointData]);

  return isReady;
};
