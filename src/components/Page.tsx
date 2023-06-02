import React from "react";
import Head from "next/head";

import GitHubLink from "@/src/components/GitHubLink";
import ToastNotification from "@/src/components/ToastNotification";
import { useToast } from "@/src/context/ToastContext";
import ErrorBoundary from "./ErrorBoundary";

export const Page: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { state: toastState } = useToast();

  React.useEffect(() => {
    fetch(`/api/next-go-healthz`).catch((error) => {
      console.error(error);
    });
  }, []);

  return (
    <>
      <Head>
        <title>NoLongr - URL Shortener</title>
        <meta
          name="description"
          content="This is a simple tool made for the simple purpose of shortening URLs!"
          key="desc"
        />
      </Head>
      <ErrorBoundary name="global">{children}</ErrorBoundary>
      <GitHubLink />
      {toastState && (
        <ToastNotification
          message={toastState.message}
          type={toastState.type}
          duration={toastState.duration}
        />
      )}
    </>
  );
};
