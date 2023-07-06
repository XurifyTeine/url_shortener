import React from "react";
import ToastNotification, { ToastNotificationProps } from "./ToastNotification";

interface StackableToastsProps {
  toastsState: ToastNotificationProps[];
}

export const StackableToasts: React.FC<StackableToastsProps> = ({
  toastsState,
}) => {
  if (!Array.isArray(toastsState)) return null;
  if (toastsState.length < 1) return null;
  return (
    <div className="flex flex-col items-end absolute bg-transparent top-0 left-0 w-full max-h-1 fixed">
      {toastsState.map((toast) => (
        <ToastNotification
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          id={toast.id}
          key={toast.id}
        />
      ))}
    </div>
  );
};

export default StackableToasts;
