import React from "react";
import { nanoid } from "nanoid";
import { ToastContext } from "./ToastContext";
import {
  ToastNotificationProps,
  ToastNotificationType,
} from "../components/ToastNotification";
import { createPortal } from "react-dom";
import StackableToasts from "../components/StackableToasts";
import { ClientOnly } from "../components/ClientOnly";
import { isClientSide } from "../utils";

export const ToastProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const [toasts, setToasts] = React.useState<ToastNotificationProps[]>([]);

  const handleSetState = React.useCallback(
    (message: string, type: ToastNotificationType, duration = 5000) => {
      const id = nanoid();
      setToasts((currentToasts) => [
        ...currentToasts,
        { message, type, duration, id },
      ]);
    },
    [toasts]
  );

  const handleDismissToast = React.useCallback(
    (id: string) => {
      setToasts((currentToasts) =>
        currentToasts.filter((toast) => toast.id !== id)
      );
    },
    [toasts]
  );

  const contextValue = React.useMemo(
    () => ({
      state: toasts,
      dispatchToast: handleSetState,
      dismissToast: handleDismissToast,
    }),
    [toasts]
  );

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
    </ToastContext.Provider>
  );
};

export default ToastProvider;
