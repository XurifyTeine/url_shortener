import React from "react";
import { Nunito } from "next/font/google";

import GitHubLink from "@/src/components/Icons/GitHubLink";
import ToastNotification from "@/src/components/ToastNotification";
import { useToast } from "@/src/context/ToastContext";
import ErrorBoundary from "./ErrorBoundary";
import PageHead from "./PageHead";
import Modal from "./Modal";
import { useModal } from "../context/ModalContext";

const inter = Nunito({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800", "900"],
  fallback: ["ui-sans-serif"],
});

export const Page: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { state: toastState } = useToast();
  const { state: modalState } = useModal();

  return (
    <>
      <PageHead />
      <ErrorBoundary name="global">
        <div style={inter.style}>{children}</div>
      </ErrorBoundary>
      {toastState && (
        <ToastNotification
          message={toastState.message}
          type={toastState.type}
          duration={toastState.duration}
        />
      )}
      {modalState && <Modal title={modalState.title} body={modalState.body} />}
    </>
  );
};
