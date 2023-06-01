import React from "react";

import GitHubLink from "@/src/components/GitHubLink";
import ToastNotification from "@/src/components/ToastNotification";
import { useToast } from "@/src/context/ToastContext";
import { BASE_URL } from "../constants";
import ErrorBoundary from "./ErrorBoundary";

export const Page: React.FC<React.PropsWithChildren> = ({ children }) => {

  React.useEffect(() => {
    console.log(`${BASE_URL}/healthz`, 'TEST')
    fetch(`${BASE_URL}/healthz`)
  }, []);

  const { state: toastState } = useToast();
  return (
    <>
      <ErrorBoundary name="global">
        {children}
      </ErrorBoundary>
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
