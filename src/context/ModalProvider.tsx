import React from "react";
import { ModalContext } from "./ModalContext";
import { ModalProps, ModalType } from "../components/Modal";

export const ModalProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const [state, setState] = React.useState<ModalProps | null>(null);

  const handleSetState = (
    title: string,
    body: React.ReactElement,
    type?: ModalType
  ) => {
    setState({ title, type, body });
  };

  const handleDismissModal = () => setState(null);

  return (
    <ModalContext.Provider
      value={{
        state,
        dispatchModal: handleSetState,
        dismissModal: handleDismissModal,
      }}
    >
      {children}
    </ModalContext.Provider>
  );
};

export default ModalProvider;
