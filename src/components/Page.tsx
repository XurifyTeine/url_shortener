import React from "react";

import GitHubLink from "@/src/components/GitHubLink";
import ToastNotification from "@/src/components/ToastNotification";
import { useToast } from "@/src/context/ToastContext";

export const Page: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { state: toastState, dispatchToast } = useToast();
  return (
    <>
      {children}
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
