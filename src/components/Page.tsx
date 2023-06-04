import React from "react";

import GitHubLink from "@/src/components/GitHubLink";
import ToastNotification from "@/src/components/ToastNotification";
import { useToast } from "@/src/context/ToastContext";
import ErrorBoundary from "./ErrorBoundary";
import PageHead from "./PageHead";

export const Page: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { state: toastState } = useToast();

  React.useEffect(() => {
    fetch(`/api/next-go-healthz`).catch((error) => {
      console.error(error);
    });
  }, []);

  return (
    <>
      <PageHead />
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
