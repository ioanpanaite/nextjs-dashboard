import React, { memo, useEffect, useMemo, useState } from "react";
import TileHeader from "../shared/TileHeader";
import scaleSvg from "@/public/svg/scale.svg";
import arrowSvg from "@/public/svg/arrow.svg";
import Image from "next/image";
import axios from "axios";
import TileWrapper from "../shared/TileWrapper";

const LOAD_TIME = 1 * 60 * 60 * 1000 // 1hour

function FearGreedTile() {
  const [fngIndex, setFngIndex] = useState<number>();

  useEffect(() => {
    const loadFng = () => {
      axios.get("/api/fng").then(({ data }) => setFngIndex(data));
    }

    loadFng()
    const timeInterval = setInterval(() => loadFng(), LOAD_TIME)

    return () => clearInterval(timeInterval)
  }, []);

  const rotationDeg = useMemo(() => {
    if (fngIndex === undefined || fngIndex < 0 || fngIndex > 100) {
      return 0;
    }

    return (fngIndex - 50) * 1.8;
  }, [fngIndex]);

  return (
    <TileWrapper>
      <div className="p-6 pb-4">
        <div className="mb-14">
          <TileHeader>Bitcoin Fear and Greed</TileHeader>
        </div>
        <div className="mb-3 flex flex-col items-center">
          <div className="relative flex justify-center mb-8">
            <Image alt="Fear and Greed Scale" src={scaleSvg} />
            <Image
              alt="Fear and Greed Indicator Arrow"
              src={arrowSvg}
              className="absolute bottom-0 left-1/2 -translate-x-1/2 origin-bottom transition-transform duration-1000"
              style={{ transform: `rotate(${rotationDeg}deg)` }}
            />
          </div>
          <div className="mb-1 text-3xl+ font-semibold">{fngIndex ?? "-"}</div>
          <div className="text-sm font-medium text-gray-light">Greed</div>
        </div>
        <div className="text-xs text-gray-light flex justify-end">
          Source: alternative.me
        </div>
      </div>
    </TileWrapper>
  );
}

export default memo(FearGreedTile);
