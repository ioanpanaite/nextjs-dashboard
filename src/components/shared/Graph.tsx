import React, {
  memo,
  useRef,
} from "react";
import classNames from "classnames";
import { ChartPoint } from "@/widgets/chart";
import { useChart } from "@/hooks/useChart";

function Graph({ pointData, isCandlestick = false }: { pointData: ChartPoint[], isCandlestick?: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isChartReady = useChart(containerRef, pointData, isCandlestick);

  return (
    <div className="h-[70px]">
      <div
        ref={containerRef}
        className={classNames({ invisible: !isChartReady })}
      ></div>
    </div>
  );
}

export default memo(Graph);
