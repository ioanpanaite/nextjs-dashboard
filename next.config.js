/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    fontLoaders: [
      { loader: "@next/font/google", options: { subsets: ["latin"] } },
    ],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "via.placeholder.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "s2.coinmarketcap.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: 'https',
        hostname: 'forflies.fra1.digitaloceanspaces.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  env: {
    NEXTAUTH_SCRET: "",
    RSS_FEED_URL: "https://cointelegraph.com/rss",
    BINANCE_WS_ENDPOINT: "wss://stream.binance.us:9443",
    BINANCE_REST_ENDPOINT: "https://fapi.binance.com",
    //BITSTAMP_WS_ENDPOINT: "wss://ws.bitstamp.net",
    //BITFINEX_WS_ENDPOINT: "wss://api-pub.bitfinex.com/ws/2",
    FUTURES_API_URL: "https://api.futures-api.com",
    FUTURES_API_KEY: '',
    CMC_API_URL: "https://pro-api.coinmarketcap.com", //CoinMarketCap
    CMC_API_KEY: "", //CoinMarketCap
    ALTERNATIVE_ME_API_URL: 'https://api.alternative.me',
    COINGECKO_API_URL: 'https://api.coingecko.com/api/v3',
    BYBIT_EXCHANGE_API_URL: 'https://api.bybit.com',
    BYBIT_EXCHANGE_API_KEY: '',
    BYBIT_EXCHANGE_API_SECRET: '',
    STRIPE_PUBLIC_KEY: "",
    STRIPE_PRIVATE_KEY: "",
    TWILIO_ACCOUNT_SID: "",
    TWILIO_AUTH_TOKEN: "",
    TWILIO_SERVICE_ID: "",
    CF_SPACE_ID: 'vtelcxzbtxv9',
    CF_DELIVERY_ACCESS_TOKEN: '',
    MONGODB_URI: "",
    GOOGLE_CLIENT_ID: "",
    GOOGLE_CLIENT_SECRET: "",
    SENDGRID_API_KEY: "",
    SENDGRID_WELCOME_EMAIL: 'd-fa9845e086e4427ca2b0e2b17926d70e',
    SENDGRID_FORGOT_PASS_EMAIL: "d-3aadc7a1fc484b348dc0dc6f2a8c2ead",
    SENDGRID_EMAIL_VERIFY: "d-3891e990297543f883544f1fda936313"
  },
};

module.exports = nextConfig;
