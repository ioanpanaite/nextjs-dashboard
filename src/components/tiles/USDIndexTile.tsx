import { IUSDIndexData } from "@/constants/coin";
import axios from "axios";
import React, { memo, useEffect, useMemo, useState } from "react";
import TileWrapper from "../shared/TileWrapper";
import GraphTile from "./GraphTile";
import { usdPeriods } from "@/constants/periods";
interface Period { 
  name: string; 
  value: string;
}

function USDIndexTile() {
  const [usdIndexData, setUsdIndexData] = useState<IUSDIndexData>();
  const [selectedPeriod, setSeletedPeriod] = useState(usdPeriods[4])

  useEffect(() => {
    handleDollar(usdPeriods[4])
  }, []);

  const handleDollar = (period: Period) => {
    setSeletedPeriod(period)
    axios.get(`/api/us-dollar-index?period=${period.value}`).then(({ data }) => setUsdIndexData(data));
  }

  const seriesFormatted = useMemo(
    () => usdIndexData?.series.map(({ t, v }) => ({ x: t, y: v })),
    [usdIndexData]
  );

  if (!usdIndexData) return null;

  return (
    <TileWrapper>
      <GraphTile
        header="US Dollar Index"
        lastValue={usdIndexData.lastValue}
        d1Change={usdIndexData.d1ChangePercent}
        w1Change={usdIndexData.w1ChangePercent}
        series={seriesFormatted}
        selectedPeriod={selectedPeriod}
        handleDollar={handleDollar}
      />
    </TileWrapper>
  );
}

export default memo(USDIndexTile);
