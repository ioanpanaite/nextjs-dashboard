import Head from "next/head";
import React, { memo, useContext } from "react";
import { UIContext } from "../context/UIContextProvider";

function PageHead() {
  const { navData } = useContext(UIContext);
  
  return (
    <Head>
      <title>{navData && navData?.site?.site_title || 'Forflies'}</title>
      <meta name="description" content="Forflies Crypto Dashboard" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="icon" href="/favicon.ico" />
    </Head>
  );
}

export default memo(PageHead);
