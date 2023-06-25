import React from "react";
import { ToastContext } from "./ToastContext";
import { ToastNotificationProps, ToastNotificationType } from "../components/ToastNotification";

export const ToastProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const [toasts, setToasts] = React.useState<ToastNotificationProps[]>([]);

  const handleSetState = (message: string, type: ToastNotificationType, duration = 5000) => {
    const prevId = toasts.length ? toasts[toasts.length - 1].id : 0;
    setToasts([...(toasts ?? []), { message, type, duration, id: prevId + 1 }]);
  };

  const handleDismissToast = (id: number) => {
    const newToasts = toasts.filter((toast) => toast.id !== id);
    setToasts(newToasts);
  };

  return (
    <ToastContext.Provider
      value={{
        state: toasts,
        dispatchToast: handleSetState,
        dismissToast: handleDismissToast,
      }}
    >
      {children}
    </ToastContext.Provider>
  );
};

export default ToastProvider;
