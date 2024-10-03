import Layout from "@/components/layout/Layout";
import PageHead from "@/components/layout/Pagehead";
import FearGreedTile from "@/components/tiles/FearGreedTile";
import LongShortTile from "@/components/tiles/LongShortTile";
import CryptoTokenTile from "@/components/tiles/CryptoTokenTile";
import InfoTile from "@/components/tiles/InfoTile";
import InfoPercentageTile from "@/components/tiles/InfoPercentageTile";
import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useBinanceStream } from "@/hooks/useBinanceStream";
import { useBitcoinData } from "@/hooks/useBitcoinData";
import { IBinanceAssetData } from "@/constants/coin";
import USDIndexTile from "@/components/tiles/USDIndexTile";
import UpcomingEvents from "@/components/tiles/UpcomingEvents";
import TileWrapper from "@/components/shared/TileWrapper";
import chevronSvg from "@/public/svg/chevron.svg";
import Image from "next/image";
import classNames from "classnames";
import { GetServerSideProps, GetServerSidePropsContext, InferGetServerSidePropsType } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]";
import { getStatusUser, getTwoFactorValid, getUserPlanStatus } from "@/utils/validation";
import axios from "axios";
import { toast } from "react-toastify";
import { signOut } from "next-auth/react";
import { useRouter } from "next/router";

const binanceTickerDataTransformer = (data: any) => {
  return {
    price: data.c,
    dailyChange: data.p,
    dailyChangePercent: data.P,
  };
};

const BINANCE_ASSETS_STORAGE_KEY = "BINANCE_ASSETS_STORAGE_KEY";
const MARKET_SUMMARY_EXPANDED_KEY = "MARKET_SUMMARY_EXPANDED";

export default function Dashboard() {
  const [binanceAssets, setBinanceAssets] = useState<IBinanceAssetData[]>([]);
  const [isMarketSummaryExpanded, setIsMarketSummaryExpanded] = useState(true);
  const [events, setEvents] = useState([]);
  const router = useRouter()
  
  const marketSummaryRef = useRef<HTMLDivElement>(null);

  const binanceTickerStreams = useMemo(() => {
    if (!binanceAssets || !binanceAssets.length) {
      return [];
    }

    return binanceAssets.reduce((acc, asset) => {
      return { ...acc, [asset.symbol]: `${asset.symbol.toLowerCase()}@ticker` };
    }, {});
  }, [binanceAssets]);

  const statusCallback = useCallback(async () => {
    try {
      const result = await axios.post('/api/settings/promo')
      if (result.data.success) {
        const info = result.data.info
        if (info.isPromo && info.isExpired) {
          toast.warning(info?.message ?? "Code has expired.", { position: "top-center", theme: "light", autoClose: false })
          // signOut()
          router.push('/onboarding/plan-expired')
        }
      }
    } catch (error) { }
  }, [])

  useEffect(() => {
    statusCallback()
  }, [])

  const eventsCallback = useCallback(async () => {
    const result = await axios.get('/api/settings/events')
    setEvents(result.data.events)
  }, [])

  useEffect(() => {
    const isExpanded = window.localStorage.getItem(MARKET_SUMMARY_EXPANDED_KEY);
    if (isExpanded !== null) {
      setIsMarketSummaryExpanded(isExpanded === "true");
    }

    eventsCallback();
  }, []);

  useEffect(() => {
    const serializedAssets = localStorage.getItem(BINANCE_ASSETS_STORAGE_KEY);
    const binanceAssets = serializedAssets
      ? JSON.parse(serializedAssets)
      : undefined;

    if (binanceAssets) {
      setBinanceAssets(binanceAssets);
    } else {
      setBinanceAssets([
        {
          baseAsset: "BTC",
          quoteAsset: "USDT",
          symbol: "BTCUSDT",
        },
        {
          baseAsset: "ETH",
          quoteAsset: "USDT",
          symbol: "ETHUSDT",
        },
        {
          baseAsset: "SOL",
          quoteAsset: "USDT",
          symbol: "SOLUSDT",
        },
        {
          baseAsset: "BNB",
          quoteAsset: "USDT",
          symbol: "BNBUSDT",
        },
      ]);
    }
  }, []);

  const toggleMarketSummary = () => {
    const value = !isMarketSummaryExpanded;
    window.localStorage.setItem(MARKET_SUMMARY_EXPANDED_KEY, value.toString());
    setIsMarketSummaryExpanded(value);
  };

  const btcData = useBitcoinData();

  const binanceCoinData = useBinanceStream(
    binanceTickerStreams,
    binanceTickerDataTransformer
  );

  const handleTokenChange = useCallback(
    (newBinanceAsset: IBinanceAssetData, index: number) => {
      const updBinanceAssets = binanceAssets?.map((asset, idx) => {
        return idx === index ? newBinanceAsset : asset;
      });

      if (updBinanceAssets) {
        localStorage.setItem(
          BINANCE_ASSETS_STORAGE_KEY,
          JSON.stringify(updBinanceAssets)
        );
        setBinanceAssets(updBinanceAssets);
      }
    },
    [binanceAssets]
  );

  return (
    <>
      <PageHead />
      <Layout>
        <div className="px-5 py-3 grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="max-md:col-span-2 max-md:row-start-6">
            <LongShortTile />
          </div>
          <div className="max-md:col-span-2 max-md:row-start-7">
            <FearGreedTile />
          </div>
          <div className="max-md:col-span-2 max-md:row-start-5">
            <USDIndexTile />
          </div>
          <div className="max-md:col-span-2 max-md:row-start-4">
            <UpcomingEvents events={events} key={events} />
          </div>
          <div className="col-span-2 grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <CryptoTokenTile
                symbolData={binanceCoinData?.[binanceAssets[0].symbol]}
                binanceAsset={binanceAssets?.[0]}
                onTokenChange={(token) => handleTokenChange(token, 0)}
              />
            </div>
            <div>
              <CryptoTokenTile
                symbolData={binanceCoinData?.[binanceAssets[1].symbol]}
                binanceAsset={binanceAssets?.[1]}
                onTokenChange={(token) => handleTokenChange(token, 1)}
              />
            </div>
          </div>
          <div className="col-span-2 grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <CryptoTokenTile
                symbolData={binanceCoinData?.[binanceAssets[2].symbol]}
                binanceAsset={binanceAssets?.[2]}
                onTokenChange={(token) => handleTokenChange(token, 2)}
              />
            </div>
            <div>
              <CryptoTokenTile
                symbolData={binanceCoinData?.[binanceAssets[3].symbol]}
                binanceAsset={binanceAssets?.[3]}
                onTokenChange={(token) => handleTokenChange(token, 3)}
              />
            </div>
          </div>
          <div className="max-md:row-start-1 col-span-2 lg:col-span-4">
            <div
              className="md:hidden mt-4 mb-5 flex justify-between items-center gap-5 cursor-pointer"
              onClick={toggleMarketSummary}
            >
              <div className="grow">
                <div className="w-full h-[1px] bg-gray-light"></div>
              </div>
              <div className="text-white text-xs md:text-sm flex items-center gap-3">
                <div>Market Summary</div>
                <div>
                  <div>
                    <Image
                      src={chevronSvg}
                      alt="Chevron icon"
                      className={classNames(
                        "min-w-[18px] sm:w-auto",
                        isMarketSummaryExpanded ? "-rotate-90" : "rotate-90"
                      )}
                    />
                  </div>
                </div>
              </div>
              <div className="grow">
                <div className="w-full h-[1px] bg-gray-light"></div>
              </div>
            </div>
            <div
              ref={marketSummaryRef}
              className="grid grid-cols-2 gap-3 overflow-hidden transition-all duration-300"
              style={{
                height:
                  isMarketSummaryExpanded && marketSummaryRef?.current
                    ? marketSummaryRef.current.scrollHeight + "px"
                    : 0,
              }}
            >
              <TileWrapper className="grid grid-cols-2 sm:max-lg:grid-cols-4 max-lg:col-span-2">
                <div className="max-lg:col-span-2 grid grid-cols-2">
                  <InfoTile
                    title="Global Market Cap"
                    value={btcData?.globalMarketCap}
                    isCurrency
                  />
                  <InfoTile
                    title="Bitcoin Market Cap"
                    value={btcData?.btcMarketCap}
                    isCurrency
                  />
                </div>
                <div className="max-lg:col-span-2 grid grid-cols-2">
                  <InfoTile
                    title="Bitcoin Dominance"
                    value={btcData?.btcDominance}
                  />
                  <InfoTile
                    title="Ethereum Dominance"
                    value={btcData?.ethDominance}
                  />
                </div>
              </TileWrapper>
              <TileWrapper className="grid grid-cols-2 max-lg:col-span-2">
                <div className="grid grid-cols-2">
                  <InfoPercentageTile
                    title="Daily"
                    value={btcData?.btcPriceChangePercentDaily}
                  />
                  <InfoPercentageTile
                    title="Weekly"
                    value={btcData?.btcPriceChangePercentWeekly}
                  />
                </div>
                <div className="grid grid-cols-2">
                  <InfoPercentageTile
                    title="Monthly"
                    value={btcData?.btcPriceChangePercentMonthly}
                  />
                  <InfoPercentageTile
                    title="Yearly"
                    value={btcData?.btcPriceChangePercentYearly}
                  />
                </div>
              </TileWrapper>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (context: GetServerSidePropsContext) => {
  const session = await getServerSession(context.req, context.res, authOptions)
  if (!session) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    }
  } else {
    const validation = await getTwoFactorValid(session?.user?.email);
    if (!validation) {
      return {
        redirect: {
          destination: '/validate_2fa',
          permanent: false,
        },
      }
    }
    
    const userNewStatus = await getStatusUser(session?.user?.email)
    if (userNewStatus) {
      return {
        redirect: {
          destination: '/onboarding',
          permanent: false,
        },
      }
    }
    
    const userPlanStatus = await getUserPlanStatus(session?.user?.email)
    if (userPlanStatus) {
      return {
        redirect: {
          destination: '/onboarding/plan-expired',
          permanent: false,
        },
      }
    }
  }

  return {
    props: {}
  }
}
