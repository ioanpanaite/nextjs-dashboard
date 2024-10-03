import React, {
  memo,
  MouseEventHandler,
  ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import TileHeader from "../shared/TileHeader";
import { debounce } from "lodash";
import {
  IBinanceLongShortData,
  ICoinGlassShortLongData,
} from "@/constants/coin";
import axios, { isAxiosError } from "axios";
import TileWrapper from "../shared/TileWrapper";
import { toast } from "react-toastify";
import { bitcoinPeriods } from "@/constants/periods";
import SelectList from "../shared/SelectList";
import ReactModal from "react-modal";
import Image from "next/image";
import closeSvg from "@/public/svg/close.svg";
import Button from "../shared/Button";
interface ILongShortIndicator {
  longPercentage: string;
  shortPercentage: string;
  ratio: string;
}

function LongShortTile() {
  const [blockCount, setBlockCount] = useState(0);
  const [binanceRetailLongShort, setBinanceRetailLongShort] =
    useState<ILongShortIndicator>();
  const [binanceTopTradersLongShort, setBinanceTopTradersLongShort] =
    useState<ILongShortIndicator>();
  const [bybitLongShort, setBybitLongShort] = useState<ILongShortIndicator>();
  const containerRef = useRef<HTMLDivElement>(null);
  const [period, setPeriod] = useState(bitcoinPeriods[6])
  const [selectedPeriod, setSeletedPeriod] = useState(bitcoinPeriods[6])
  const [isPeriod, setIsPeriod] = useState(false)

  useEffect(() => {
    if (containerRef?.current) {
      const debouncedResize = debounce(([data]) => {
        const blockCount = Math.round(data.contentRect.width / 6);
        setBlockCount(blockCount);
      }, 150);

      new ResizeObserver(debouncedResize).observe(containerRef.current);
    }
  }, []);

  useEffect(() => {
    Promise.all([
      axios.get("/api/long-short-binance").then(({ data }) => data),
      axios.get("/api/long-short-bybit").then(({ data }) => data),
    ]).then(
      ([binance, bybit]: [
        binance: IBinanceLongShortData,
        bybit: ICoinGlassShortLongData
      ]) => {
        setBinanceRetailLongShort({
          longPercentage: (Number(binance.retail.longAccount) * 100).toFixed(2),
          shortPercentage: (Number(binance.retail.shortAccount) * 100).toFixed(
            2
          ),
          ratio: Number(binance.retail.longShortRatio).toFixed(2),
        });
        setBinanceTopTradersLongShort({
          longPercentage: (
            Number(binance.topTraders.longAccount) * 100
          ).toFixed(2),
          shortPercentage: (
            Number(binance.topTraders.shortAccount) * 100
          ).toFixed(2),
          ratio: Number(binance.topTraders.longShortRatio).toFixed(2),
        });
        setBybitLongShort({
          longPercentage: (Number(bybit.buyRatio) * 100).toFixed(2),
          shortPercentage: (Number(bybit.sellRatio) * 100).toFixed(2),
          ratio: ((Number(bybit.sellRatio) / Number(bybit.sellRatio)) * 100).toFixed(2),
        });
      }
    ).catch((error) => {
      console.log(error)
    });
  }, []);

  const handleBitcoinPeriod = () => {
    setIsPeriod(true)
  }

  const handleLeaveEditMode = () => {
    setIsPeriod(false)
  };

  const handlePeriodConfirm: MouseEventHandler = (e) => {
    e.preventDefault();
    setSeletedPeriod(period)
    setIsPeriod(false)

    Promise.all([
      axios.get(`/api/long-short-binance?period=${period.binance}`).then(({ data }) => data),
      axios.get(`/api/long-short-bybit?period=${period.bybit}`).then(({ data }) => data),
    ]).then(
      ([binance, bybit]: [
        binance: IBinanceLongShortData,
        bybit: ICoinGlassShortLongData
      ]) => {
        setBinanceRetailLongShort({
          longPercentage: (Number(binance.retail.longAccount) * 100).toFixed(2),
          shortPercentage: (Number(binance.retail.shortAccount) * 100).toFixed(
            2
          ),
          ratio: Number(binance.retail.longShortRatio).toFixed(2),
        });
        setBinanceTopTradersLongShort({
          longPercentage: (
            Number(binance.topTraders.longAccount) * 100
          ).toFixed(2),
          shortPercentage: (
            Number(binance.topTraders.shortAccount) * 100
          ).toFixed(2),
          ratio: Number(binance.topTraders.longShortRatio).toFixed(2),
        });
        setBybitLongShort({
          longPercentage: (Number(bybit.buyRatio) * 100).toFixed(2),
          shortPercentage: (Number(bybit.sellRatio) * 100).toFixed(2),
          ratio: ((Number(bybit.sellRatio) / Number(bybit.sellRatio)) * 100).toFixed(2),
        });
      }
    ).catch((error) => {
      console.log(error)
    });
  }

  return (
    <TileWrapper>
      <div ref={containerRef} className="p-6 pb-7 relative">
        <div className="mb-8">
          <TileHeader
            infoTooltipContent={
              <>
                The proportion of net long and net short accounts to total
                accounts with positions. Each account is counted once only.
                <br />
                Long Account % = Accounts with net long positions / Total
                Accounts with positions
                <br />
                Short Account % = Accounts with net short positions / Total
                Accounts with positions
                <br />
                Long/Short Ratio = Long Account % / Short Account %
              </>
            }
          >
            <div className="flex justify-between">
              <div>Bitcoin Long/Short</div>
              <div onClick={handleBitcoinPeriod} className="text-white cursor-default">{selectedPeriod.name.toUpperCase()}</div>
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
                      <SelectList title="" items={bitcoinPeriods} selected={period} setSelected={setPeriod} />
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
          </TileHeader>
        </div>

        <div className="flex flex-col gap-5">
          {binanceRetailLongShort && (
            <Indicator
              title="Binance (Retail)"
              longPercentage={binanceRetailLongShort?.longPercentage}
              shortPercentage={binanceRetailLongShort?.shortPercentage}
              ratio={binanceRetailLongShort?.ratio}
              totalCount={blockCount}
            ></Indicator>
          )}
          {binanceTopTradersLongShort && (
            <Indicator
              title="Binance (Top Traders)"
              longPercentage={binanceTopTradersLongShort?.longPercentage}
              shortPercentage={binanceTopTradersLongShort?.shortPercentage}
              ratio={binanceTopTradersLongShort?.ratio}
              totalCount={blockCount}
            ></Indicator>
          )}
          {bybitLongShort && (
            <Indicator
              title="Bybit (Retail & Top Traders)"
              longPercentage={bybitLongShort?.longPercentage}
              shortPercentage={bybitLongShort?.shortPercentage}
              ratio={bybitLongShort?.ratio}
              totalCount={blockCount}
            ></Indicator>
          )}
        </div>
      </div>
    </TileWrapper>
  );
}

function Indicator({
  title,
  longPercentage,
  shortPercentage,
  ratio,
  totalCount,
}: {
  title: string;
  longPercentage: string;
  shortPercentage: string;
  ratio: string;
  totalCount: number;
}) {
  const percentageRounded = useMemo(
    () => Math.round(Number(longPercentage)),
    [longPercentage]
  );

  const arr = useMemo(
    () =>
      Array(totalCount)
        .fill(undefined)
        .map((_, i) =>
          Math.round((i + 1) * (100 / totalCount)) <= percentageRounded
            ? "bg-blue"
            : "bg-orange"
        ),
    [percentageRounded, totalCount]
  );

  return (
    <div>
      <div className="mb-1 flex justify-between">
        <div className="text-sm font-medium">
          {title}: {ratio}
        </div>
      </div>
      <div className="mb-2 flex justify-between gap-1">
        {arr.map((color, idx) => (
          <div key={idx} className={`w-[1px] h-[15px] ${color}`}></div>
        ))}
      </div>
      <div className="flex justify-between">
        <div className="text-blue font-semibold">{longPercentage}</div>
        <div className="text-orange font-semibold">{shortPercentage}</div>
      </div>
    </div>
  );
}

export default memo(LongShortTile);
