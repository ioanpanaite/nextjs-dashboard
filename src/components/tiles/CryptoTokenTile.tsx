import Image from "next/image";
import React, {
  ChangeEvent,
  MouseEventHandler,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import pencilSvg from "@/public/svg/pencil.svg";
import closeSvg from "@/public/svg/close.svg";
import classNames from "classnames";
import Input from "../shared/Input";
import Button from "../shared/Button";
import ReactModal from "react-modal";
import { IBinanceAssetData, ICMCCoinData, ISymbolData } from "@/constants/coin";
import dynamic from "next/dynamic";
import { MyContext } from "../context/MyContextProvider";
import { toast } from "react-toastify";
import { formatCurrency, getPriceFractionDigits } from "@/lib/utils";
import { ChartPoint } from "@/widgets/chart";
import TileWrapper from "../shared/TileWrapper";
import SymbolSearch from "../shared/SymbolSearch";
import SelectList from "../shared/SelectList";
import { periods } from "@/constants/periods";


const GraphDynamic = dynamic(() => import("../shared/Graph"), {
  ssr: false,
});

function CryptoTokenTile({
  symbolData,
  binanceAsset,
  onTokenChange,
}: {
  symbolData: ISymbolData | undefined;
  binanceAsset: IBinanceAssetData;
  onTokenChange: (binanceAsset: IBinanceAssetData) => void;
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [tokenInput, setTokenInput] = useState("");
  const [graphData, setGraphData] = useState<ChartPoint[]>([]);
  const [filterSymbols, setSymbols] = useState<ICMCCoinData[]>([])
  const [period, setPeriod] = useState(periods[5])
  const [confirmPeriod, setConfirmPeriod] = useState(periods[5])
  const [isPeriod, setIsPeriod] = useState(false)

  const { binanceAssets, cmcCoinData } = useContext(MyContext);

  useEffect(() => {
    setIsSmallScreen(window.innerWidth < 768);
  }, []);

  useEffect(() => {
    if (binanceAsset?.symbol) {
      fetch(
        `https://api.binance.us/api/v3/klines?symbol=${binanceAsset?.symbol}&interval=${confirmPeriod.value}&limit=100`
      )
        .then((response) => response.json())
        .then((data) => {
          const timeSeries: ChartPoint[] = data?.map((d: number[]) => ({
            x: d[0],
            // y: d[4],
            y: [d[1], d[2], d[3], d[4]],
          }));

          setGraphData(timeSeries);
        })
        .catch((e) => {
          console.error(
            `Failed to fetch graph data for ${binanceAsset?.symbol}`,
            e
          );
        });
    }
  }, [period, binanceAsset]);

  const coinMeta = useMemo(() => {
    if (binanceAsset && cmcCoinData) {
      return cmcCoinData.find(
        ({ symbol }) => symbol === binanceAsset.baseAsset
      );
    }
  }, [cmcCoinData, binanceAsset]);

  const priceFormatted = useMemo(() => {
    if (symbolData?.price === undefined || isNaN(symbolData?.price)) return;

    const fractionDigits = getPriceFractionDigits(symbolData?.price);

    return formatCurrency(symbolData?.price, fractionDigits);
  }, [symbolData]);
  const dailyChangeFormatted = useMemo(() => {
    if (symbolData?.dailyChange === undefined || isNaN(symbolData?.dailyChange))
      return;

    const fractionDigits = getPriceFractionDigits(symbolData?.dailyChange);

    return formatCurrency(symbolData?.dailyChange, fractionDigits);
  }, [symbolData]);

  const handleEnterEditMode = useCallback(() => {
    if (isSmallScreen) {
      setIsModalOpen(true);
    } else {
      setIsEditing(true);
    }
  }, [isSmallScreen]);

  const handleLeaveEditMode = useCallback(() => {
    setIsEditing(false);
  }, []);

  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const filterCoin = useCallback((symbol: string) => {
    let filtered: string | any[] = []
    const len = Math.floor(cmcCoinData.length / 100) + 1

    for (let i = 0; i < len; i++) {
      let coins = cmcCoinData.slice(i * 100, (i + 1) * 100);
      let filter = coins.filter((v: any) => v.symbol.includes(symbol) == true || v.name.toLowerCase().includes(symbol.toLowerCase()) == true)

      if (filter.length > 0 && filtered.length < 50) {
        filtered = [ ...filtered, ...filter ]
      } else if (filtered.length < 50) {
        continue;
      } else {
        break;
      }
    }
    return filtered
  }, [cmcCoinData]);

  const handleTokenInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value.toUpperCase();
      setTokenInput(value);

      const filter = filterCoin(value);
      setSymbols(filter)
    },
    [filterCoin, setSymbols]
  );

  const handleSymbolConfirm = useCallback((coin: string) => {
    const coinMeta = cmcCoinData?.find(({ symbol }) => symbol === coin);

    if (!coinMeta) {
      toast.error("Unsupported coin symbol, please type: BTC, ETH etc.");
    } else {
      onTokenChange({
        baseAsset: coin,
        quoteAsset: "USDT",
        symbol: `${coin}USDT`,
      });
      setIsModalOpen(false);
      setIsEditing(false);
      setTokenInput("");
      setSymbols([]);
    }
  }, [onTokenChange, cmcCoinData])

  const handleTokenChangeConfirm: MouseEventHandler = useCallback(
    (e) => {
      e.preventDefault();
      // const existingBinanceAsset = binanceAssets.find(
      //   ({ baseAsset }) => baseAsset === tokenInput
      // );

      const coinMeta = cmcCoinData?.find(({ symbol }) => symbol === tokenInput);

      if (!coinMeta) {
        toast.error("Unsupported coin symbol, please type: BTC, ETH etc.");
      } else {
        onTokenChange({
          baseAsset: tokenInput,
          quoteAsset: "USDT",
          symbol: `${tokenInput}USDT`,
        });
        setIsModalOpen(false);
        setIsEditing(false);
        setTokenInput("");
      }
    },
    [tokenInput, onTokenChange, cmcCoinData]
  );

  const handleCoinPeriod: MouseEventHandler = useCallback((e) => {
    setIsPeriod(true)
  }, []);

  const handlePeriodMode = () => {
    setIsPeriod(false)
  }

  // User confirmed
  const handlePeriodConfirm: MouseEventHandler = (e) => {
    e.preventDefault();
    setIsPeriod(false)
    setConfirmPeriod(period)
  }

  const customStyles = {
    content: {
      top: "50%",
      left: "50%",
      right: "auto",
      bottom: "auto",
      width: "90vw",
      transform: "translate(-50%, -50%)",
      borderRadius: 0,
      border: 0,
      padding: 0,
    },
    overlay: {
      zIndex: 20,
      background: "rgba(19, 21, 23, 0.7)",
      backdropFilter: "blur(2.5px)",
    },
  };

  return (
    <TileWrapper>
      <div className="p-4 md:p-6 pb-7 relative">
        <ReactModal
          isOpen={isModalOpen}
          onRequestClose={handleModalClose}
          style={customStyles}
          preventScroll={true}
          shouldCloseOnOverlayClick={false}
          contentLabel="Change Coin Symbol Modal"
        >
          <form className="border border-blue bg-black flex flex-col justify-between">
            <div className="px-4.5 pt-7 pb-9 h-full flex flex-col justify-between">
              <div className="flex justify-between items-center">
                <div>Change coin symbol</div>
                <div
                  className="p-2 pr-0 cursor-pointer"
                  onClick={handleModalClose}
                >
                  <Image alt="Close icon" src={closeSvg} className="w-[10px]" />
                </div>
              </div>
              <div>
                <Input
                  value={tokenInput}
                  placeholder="Enter coin symbol"
                  autoFocus
                  onChange={(e) => handleTokenInputChange(e)}
                />
              </div>
              <div className="mt-2">
                <SymbolSearch symbols={filterSymbols} handleSymbol={handleSymbolConfirm} />
              </div>
            </div>
            <div>
              <Button
                type="submit"
                onClick={handleTokenChangeConfirm}
                disabled={!tokenInput}
                loadingType={false}
              >
                Confirm
              </Button>
            </div>
          </form>
        </ReactModal>
        {isEditing && (
          <form className="absolute z-50 inset-0 border border-blue bg-black flex flex-col justify-between">
            <div className="px-4.5 pt-7 pb-9 h-full flex flex-col justify-between">
              <div className="flex justify-between items-center">
                <div className="text-lg">Change coin symbol</div>
                <div
                  className="p-2 pr-0 cursor-pointer"
                  onClick={handleLeaveEditMode}
                >
                  <Image alt="Close icon" src={closeSvg} className="w-[10px]" />
                </div>
              </div>
              <div>
                <Input
                  value={tokenInput}
                  placeholder="Enter coin symbol"
                  autoFocus
                  onChange={(e) => handleTokenInputChange(e)}
                />
              </div>
              <div className="mt-2">
                <SymbolSearch symbols={filterSymbols} handleSymbol={handleSymbolConfirm} />
              </div>
            </div>
            <div>
              <Button
                type="submit"
                onClick={handleTokenChangeConfirm}
                disabled={!tokenInput}
                loadingType={false}
              >
                Confirm
              </Button>
            </div>
          </form>
        )}
        <div className="mb-2 flex justify-between items-center">
          <div className="mr-3 md:mr-3.5">
            <div className="w-5 sm:w-6">
              {coinMeta?.cmc_id && (
                <Image
                  alt="Coin logo"
                  src={`https://s2.coinmarketcap.com/static/img/coins/64x64/${coinMeta.cmc_id}.png`}
                  className="w-full"
                  width={60}
                  height={60}
                  title={coinMeta?.name || binanceAsset?.baseAsset}
                />
              )}
            </div>
          </div>
          <div className="overflow-hidden grow">
            <div className="text-lg sm:text-2xl text-ellipsis whitespace-nowrap overflow-hidden md:max-w-[180px]" title={coinMeta?.name || binanceAsset?.baseAsset}>
              {coinMeta?.name || binanceAsset?.baseAsset}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div onClick={handleCoinPeriod} className="max-sm:text-xs cursor-default">{confirmPeriod.name.toUpperCase()}</div>
            {isPeriod && (
              <form className="absolute z-50 inset-0 border border-blue bg-black flex flex-col justify-between">
                <div className="px-4.5 pt-7 pb-9 h-full flex flex-col justify-between">
                  <div className="flex justify-between items-center">
                    <div className="text-lg">Change period time</div>
                    <div
                      className="p-2 pr-0 cursor-pointer"
                      onClick={handlePeriodMode}
                    >
                      <Image alt="Close icon" src={closeSvg} className="w-[10px]" />
                    </div>
                  </div>
                  <div>
                    <SelectList title="" items={periods} selected={period} setSelected={setPeriod} />
                  </div>
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
            <div
              className="cursor-pointer p-1 w-6 md:w-6"
              onClick={handleEnterEditMode}
            >
              <Image alt="Pencil" src={pencilSvg} className="w-full" />
            </div>
          </div>
        </div>
        <div className="flex flex-col items-center">
          <div className="mb-6 h-[70px]">
            <GraphDynamic pointData={graphData} isCandlestick={false} />
          </div>

          <div className="mb-2 text-2xl+ md:text-3xl+ font-semibold">
            {priceFormatted ?? "-"}
          </div>
          {symbolData !== undefined && (
            <div className="text-xs sm:text-sm font-medium">
              <span className="text-gray-light">
                {symbolData.dailyChange < 0
                  ? dailyChangeFormatted
                  : `+${dailyChangeFormatted}`}
              </span>
              &nbsp;
              <span
                className={classNames(
                  symbolData.dailyChangePercent < 0
                    ? "text-orange"
                    : "text-green"
                )}
              >
                (
                {symbolData.dailyChangePercent < 0
                  ? `${symbolData.dailyChangePercent}%`
                  : `+${symbolData.dailyChangePercent}%`}
                )
              </span>
            </div>
          )}
        </div>
      </div>
    </TileWrapper>
  );
}

export default CryptoTokenTile;
