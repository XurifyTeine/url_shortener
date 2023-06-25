import React from "react";
import { ToastNotificationProps, ToastNotificationType } from "../components/ToastNotification";

export interface ToastContextInterface {
  state: ToastNotificationProps[];
  dispatchToast: ((message: string, type: ToastNotificationType, duration?: number) => void) | (() => void);
  dismissToast: (id: number) => void;
}

export const ToastContext = React.createContext<ToastContextInterface>({
  state: [],
  dispatchToast: () => null,
  dismissToast: () => null,
});

export const useToast = () => React.useContext(ToastContext);