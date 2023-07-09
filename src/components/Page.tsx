import React from "react";
import { Nunito } from "next/font/google";

import { useModal } from "@/src/context/ModalContext";

import ErrorBoundary from "./ErrorBoundary";
import PageHead from "./PageHead";
import Modal from "./Modal";
import StackableToasts from "./StackableToasts";

const inter = Nunito({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800", "900"],
  fallback: ["ui-sans-serif"],
});

export const Page: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { state: modalState } = useModal();

  return (
    <>
      <PageHead />
      <ErrorBoundary name="global">
        <div style={inter.style}>{children}</div>
      </ErrorBoundary>
      {modalState && <Modal title={modalState.title} body={modalState.body} />}
    </>
  );
};
