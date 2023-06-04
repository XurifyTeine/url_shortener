import React from "react";
import Head from "next/head";

export const PageHead: React.FC = () => {
  return (
    <Head>
      <title>NoLongr - URL Shortener</title>
      <meta
        name="description"
        content="This is a simple tool made for the simple purpose of shortening URLs!"
        key="desc"
      />
      <meta property="og:image" content="https://nolongr.vercel.app/api/og" />
      <meta property="og:title" content="NoLongr" />
      <meta property="og:description" content="NoLongr - URL Shortener" />
      <meta property="og:url" content="https://nolongr.vercel.app" />
      <meta
        property="twitter:image"
        content="https://nolongr.vercel.app/api/og"
      />
      <meta property="twitter:card" content="app" />
      <meta property="twitter:title" content="NoLongr" />
      <meta property="twitter:description" content="NoLongr - URL Shortener" />
    </Head>
  );
};

export default PageHead;
