import React from "react";
import { ModalProps } from "../components/Modal";

export interface ModalContextInterface {
  state: ModalProps | null;
  dispatchModal: ((title: string, body: React.ReactElement) => void) | (() => void);
  dismissModal: () => void;
}

export const ModalContext = React.createContext<ModalContextInterface>({
  state: null,
  dispatchModal: () => null,
  dismissModal: () => null,
});

export const useModal = () => React.useContext(ModalContext);