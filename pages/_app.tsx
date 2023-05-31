import React from "react";
import type { AppProps } from "next/app";

import "@/styles/globals.css";

import { ToastProvider } from "@/src/context/ToastProvider";
import { Page } from "@/src/components/Page";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <ToastProvider>
        <Page>
          <Component {...pageProps} />
        </Page>
      </ToastProvider>
    </>
  );
}
