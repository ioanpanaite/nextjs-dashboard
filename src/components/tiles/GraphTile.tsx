import { formatCurrency } from "@/lib/utils";
import { ChartPoint } from "@/widgets/chart";
import classNames from "classnames";
import dynamic from "next/dynamic";
import Image from "next/image";
import React, { MouseEventHandler, memo, useMemo, useState } from "react";
import TileHeader from "../shared/TileHeader";
import closeSvg from "@/public/svg/close.svg";
import SelectList from "../shared/SelectList";
import Button from "../shared/Button";
import { usdPeriods } from "@/constants/periods";

interface Period { 
  name: string; 
  value: string;
}

const GraphDynamic = dynamic(() => import("../shared/Graph"), {
  ssr: false,
});

function GraphTile({
  header,
  lastValue,
  d1Change,
  w1Change,
  series,
  selectedPeriod,
  handleDollar
}: {
  header: string;
  lastValue: number;
  d1Change: number;
  w1Change: number;
  series?: ChartPoint[];
  selectedPeriod: Period;
  handleDollar: (period: Period) => void;
}) {
  const lastValueFormatted = useMemo(
    () => formatCurrency(lastValue),
    [lastValue]
  );
  const [isPeriod, setIsPeriod] = useState(false)
  const [period, setPeriod] = useState(usdPeriods[4])

  const handleLeaveEditMode = () => {
    setIsPeriod(false)
  };

  const handlePeriodConfirm: MouseEventHandler = (e) => {
    handleDollar(period)
    setIsPeriod(false)
  }

  const handleOpenModal: MouseEventHandler = (e) => {
    setIsPeriod(true)
  }
  
  return (
    <div className="p-6 pb-7 h-full flex flex-col justify-between">
      <div className="mb-1 relative">
        <TileHeader>{header}</TileHeader>
        <div className="text-sm font-medium mb-10 flex justify-between">
          <p>Last Value {lastValueFormatted}</p>
          <p className="cursor-default" onClick={handleOpenModal}>{selectedPeriod.name.toUpperCase()}</p>
        </div>
        {isPeriod && (
          <form className="absolute z-10 h-[200px] text-white inset-0 border border-blue bg-black flex flex-col justify-between">
            <div className="px-4.5 pt-7 pb-9 h-full flex flex-col justify-between">
              <div className="flex justify-between items-center">
                <div>Change time period</div>
                <div
                  className="p-2 pr-0 cursor-pointer"
                  onClick={handleLeaveEditMode}
                >
                  <Image alt="Close icon" src={closeSvg} className="w-[10px]" />
                </div>
              </div>
              <div className="">
                <SelectList title="" items={usdPeriods} selected={period} setSelected={setPeriod} />
              </div>
              <div></div>
            </div>
            <div>
              <Button
                type="submit"
                loadingType={false}
                onClick={handlePeriodConfirm}
              >
                Confirm
              </Button>
            </div>
          </form>
        )}
      </div>

      <div>
        <div className="mb-8 flex justify-center">
          {series ? (
            <GraphDynamic pointData={series} />
          ) : (
            <Image
              alt="temp"
              src="https://via.placeholder.com/300x134/6C9FCE/FFF?text=Graph placeholder"
              width={300}
              height={134}
              className=""
            />
          )}
        </div>
      </div>
      <div>
        <div className="flex justify-between text-2xl font-semibold">
          <div
            className={classNames(d1Change < 0 ? "text-orange" : "text-green")}
          >
            {d1Change < 0 ? `${d1Change}%` : `+${d1Change}%`}
          </div>
          <div
            className={classNames(w1Change < 0 ? "text-orange" : "text-green")}
          >
            {w1Change < 0 ? `${w1Change}%` : `+${w1Change}%`}
          </div>
        </div>
        <div className="flex justify-between text-gray-light text-sm font-medium">
          <div>24 hours</div>
          <div>7 days</div>
        </div>
      </div>
    </div>
  );
}

export default memo(GraphTile);
