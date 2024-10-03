export enum CoinPairSymbol {
  BTCUSD = "tBTCUSD",
  ETHUSD = "tETHUSD",
  SOLUSD = "tSOLUSD",
  BNBUSD = "tBNBUSD",
}

export interface ISymbolData {
  price: number;
  dailyChange: number;
  dailyChangePercent: number;
}

export type SymbolData = { [k in CoinPairSymbol]?: ISymbolData };

export interface IBitcoinData {
  globalMarketCap: number;
  btcMarketCap: number;
  btcDominance: number;
  ethDominance: number;
  btcPriceChangePercentDaily: number;
  btcPriceChangePercentWeekly: number;
  btcPriceChangePercentMonthly: number;
  btcPriceChangePercentYearly: number;
}

export interface IBinanceAssetData {
  symbol: string;
  baseAsset: string;
  quoteAsset: string;
}

export interface ICMCCoinData {
  cmc_id: string;
  name: string;
  symbol: string;
}

export interface IBinanceLongShortData {
  retail: IBinanceLongShort;
  topTraders: IBinanceLongShort;
}
export interface IBinanceLongShort {
  symbol: string;
  longShortRatio: string;
  longAccount: string;
  shortAccount: string;
  timestamp: string;
}

export interface ICoinGlassShortLongData {
  exchangeName: string;
  buyRatio: number;
  sellRatio: number;
  longShortRatio: number;
}

export interface IUSDIndexData {
  lastValue: number;
  d1ChangePercent: number;
  w1ChangePercent: number;
  series: { t: number; v: number }[];
}

export const currency = [
  { id: "None", name: "None" },
  { id: "BTC", name: "Bitcoin", img: "https://s2.coinmarketcap.com/static/img/coins/64x64/1.png" },
  { id: "ETH", name: "Ethereum", img: "https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png" },
  { id: "SOL", name: "Solana", img: "https://s2.coinmarketcap.com/static/img/coins/64x64/5426.png" },
  { id: "BNB", name: "BNB", img: "https://s2.coinmarketcap.com/static/img/coins/64x64/1839.png" },
]

export const exchangeList = [
  { id: "None", name: "None" },
  { id: "Bybit", name: "Bybit" },
  { id: "BingX", name: "BingX" },
  { id: "OKX", name: "OKX" },
  { id: "CoinW", name: "CoinW" },
  { id: "PrimeXBT", name: "PrimeXBT" },
  { id: "Binance", name: "Binance" },
  { id: "Bitfinex", name: "Bitfinex" },
  { id: "BitMart", name: "BitMart" },
  { id: "BitMEX", name: "BitMEX" },
  { id: "Bitstamp", name: "Bitstamp" },
  { id: "Coinbase", name: "Coinbase" },
  { id: "eToro", name: "eToro" },
  { id: "Gemini", name: "Gemini" },
  { id: "Huobi", name: "Huobi" },
  { id: "Kraken", name: "Kraken" },
  { id: "KuCoin", name: "KuCoin" },
  { id: "MEXC", name: "MEXC" },
  { id: "OTHER", name: "OTHER" },
]

export const exceptTokens = [
  {
    "cmc_id": 825,
    "name": "Tether USDt",
    "symbol": "USDT"
  },
  {
    "cmc_id": 3408,
    "name": "USDC",
    "symbol": "USDC"
  },
  {
    "cmc_id": 2010,
    "name": "Cardano",
    "symbol": "ADA"
  },
  {
    "cmc_id": 11419,
    "name": "Toncoin",
    "symbol": "TON"
  },
  {
    "cmc_id": 1958,
    "name": "TRON",
    "symbol": "TRX"
  },
  {
    "cmc_id": 3957,
    "name": "UNUS SED LEO",
    "symbol": "LEO"
  },
  {
    "cmc_id": 4847,
    "name": "Stacks",
    "symbol": "STX"
  },
  {
    "cmc_id": 1321,
    "name": "Ethereum Classic",
    "symbol": "ETC"
  },
  {
    "cmc_id": 3635,
    "name": "Cronos",
    "symbol": "CRO"
  },
  {
    "cmc_id": 22974,
    "name": "Bittensor",
    "symbol": "TAO"
  },
  {
    "cmc_id": 20396,
    "name": "Kaspa",
    "symbol": "KAS"
  },
  {
    "cmc_id": 4157,
    "name": "THORChain",
    "symbol": "RUNE"
  },
  {
    "cmc_id": 28752,
    "name": "dogwifhat",
    "symbol": "WIF"
  },
  {
    "cmc_id": 1518,
    "name": "Maker",
    "symbol": "MKR"
  },
  {
    "cmc_id": 5632,
    "name": "Arweave",
    "symbol": "AR"
  },
  {
    "cmc_id": 27075,
    "name": "Mantle",
    "symbol": "MNT"
  },
  {
    "cmc_id": 26081,
    "name": "First Digital USD",
    "symbol": "FDUSD"
  },
  {
    "cmc_id": 328,
    "name": "Monero",
    "symbol": "XMR"
  },
  {
    "cmc_id": 22861,
    "name": "Celestia",
    "symbol": "TIA"
  },
  {
    "cmc_id": 4558,
    "name": "Flow",
    "symbol": "FLOW"
  },
  {
    "cmc_id": 28298,
    "name": "Beam",
    "symbol": "BEAM"
  },
  {
    "cmc_id": 23149,
    "name": "Sei",
    "symbol": "SEI"
  },
  {
    "cmc_id": 7334,
    "name": "Conflux",
    "symbol": "CFX"
  },
  {
    "cmc_id": 7278,
    "name": "Aave",
    "symbol": "AAVE"
  },
  {
    "cmc_id": 29210,
    "name": "Jupiter",
    "symbol": "JUP"
  },
  {
    "cmc_id": 3602,
    "name": "Bitcoin SV",
    "symbol": "BSV"
  },
  {
    "cmc_id": 28324,
    "name": "dYdX (Native)",
    "symbol": "DYDX"
  },
  {
    "cmc_id": 22691,
    "name": "Starknet",
    "symbol": "STRK"
  },
  {
    "cmc_id": 23095,
    "name": "Bonk",
    "symbol": "BONK"
  },
  {
    "cmc_id": 2586,
    "name": "Synthetix",
    "symbol": "SNX"
  },
  {
    "cmc_id": 16086,
    "name": "BitTorrent (New)",
    "symbol": "BTT"
  },
  {
    "cmc_id": 25028,
    "name": "ORDI",
    "symbol": "ORDI"
  },
  {
    "cmc_id": 28177,
    "name": "Pyth Network",
    "symbol": "PYTH"
  },
  {
    "cmc_id": 13502,
    "name": "Worldcoin",
    "symbol": "WLD"
  },
  {
    "cmc_id": 2087,
    "name": "KuCoin Token",
    "symbol": "KCS"
  },
  {
    "cmc_id": 11092,
    "name": "Bitget Token",
    "symbol": "BGB"
  },
  {
    "cmc_id": 7431,
    "name": "Akash Network",
    "symbol": "AKT"
  },
  {
    "cmc_id": 2424,
    "name": "SingularityNET",
    "symbol": "AGIX"
  },
  {
    "cmc_id": 8646,
    "name": "Mina",
    "symbol": "MINA"
  },
  {
    "cmc_id": 7950,
    "name": "Flare",
    "symbol": "FLR"
  },
  {
    "cmc_id": 28683,
    "name": "SATS",
    "symbol": "1000SATS"
  },
  {
    "cmc_id": 18876,
    "name": "ApeCoin",
    "symbol": "APE"
  },
  {
    "cmc_id": 21159,
    "name": "Ondo",
    "symbol": "ONDO"
  },
  {
    "cmc_id": 14101,
    "name": "Ronin",
    "symbol": "RON"
  },
  {
    "cmc_id": 11156,
    "name": "dYdX (ethDYDX)",
    "symbol": "ETHDYDX"
  },
  {
    "cmc_id": 1720,
    "name": "IOTA",
    "symbol": "IOTA"
  },
  {
    "cmc_id": 1376,
    "name": "Neo",
    "symbol": "NEO"
  },
  {
    "cmc_id": 8425,
    "name": "JasmyCoin",
    "symbol": "JASMY"
  },
  {
    "cmc_id": 4846,
    "name": "Kava",
    "symbol": "KAVA"
  },
  {
    "cmc_id": 7186,
    "name": "PancakeSwap",
    "symbol": "CAKE"
  },
  {
    "cmc_id": 3897,
    "name": "OKB",
    "symbol": "OKB"
  },
  {
    "cmc_id": 9104,
    "name": "AIOZ Network",
    "symbol": "AIOZ"
  }
]