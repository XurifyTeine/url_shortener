import React from "react";
import type { AppProps } from "next/app";
import { Analytics } from "@vercel/analytics/react";

import "@/styles/globals.css";

import { ToastProvider } from "@/src/context/ToastProvider";
import ModalProvider from "@/src/context/ModalProvider";
import { Page } from "@/src/components/Page";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <ToastProvider>
        <ModalProvider>
          <Page>
            <Component {...pageProps} />
            <Analytics />
          </Page>
        </ModalProvider>
      </ToastProvider>
    </>
  );
}
