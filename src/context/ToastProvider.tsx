import React from "react";
import { ToastContext } from "./ToastContext";
import { ToastNotificationProps, ToastNotificationType } from "../components/ToastNotification";

export const ToastProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const [state, setState] = React.useState<ToastNotificationProps | null>(null);

  const handleSetState = (message: string, type: ToastNotificationType) => {
    setState({ message, type });
  };

  const handleDismissToast = () => setState(null);

  return (
    <ToastContext.Provider
      value={{
        state,
        dispatchToast: handleSetState,
        dismissToast: handleDismissToast,
      }}
    >
      {children}
    </ToastContext.Provider>
  );
};

export default ToastProvider;
