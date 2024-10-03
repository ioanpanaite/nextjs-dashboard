import "@/styles/globals.css";
import "react-toastify/dist/ReactToastify.css";
import 'react-tooltip/dist/react-tooltip.css'
import "keen-slider/keen-slider.min.css";
import { Poppins } from "@next/font/google";
import type { AppProps } from "next/app";
import Modal from "react-modal";
import { ToastContainer } from "react-toastify";
import { AppContextProvider } from "@/components/context/AppContextProvider";
import { SessionProvider } from "next-auth/react";
import Head from 'next/head';

const poppins = Poppins({
  variable: "--font-poppins",
  weight: ["400", "500", "600"],
});

Modal.setAppElement("#__next");

export default function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <>
      <Head>
        <link rel="icon" href="/favicon.png" />
      </Head>
      <SessionProvider session={session}>
        <AppContextProvider>
          <div className={`ch-app-wrapper ${poppins.variable}`}>
            <Component {...pageProps} />
          </div>
          <ToastContainer theme="dark" />
        </AppContextProvider>
      </SessionProvider>
    </>
  );
}
