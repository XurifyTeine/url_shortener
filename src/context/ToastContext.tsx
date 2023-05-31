import React from "react";
import { ToastNotificationProps, ToastNotificationType } from "../components/ToastNotification";

export interface ToastContextInterface {
  state: ToastNotificationProps | null;
  dispatchToast: ((message: string, type: ToastNotificationType) => void) | (() => void);
  dismissToast: () => void;
}

export const ToastContext = React.createContext<ToastContextInterface>({
  state: null,
  dispatchToast: () => null,
  dismissToast: () => null,
});

export const useToast = () => React.useContext(ToastContext);