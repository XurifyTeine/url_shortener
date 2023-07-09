import React from "react";
import ToastNotification from "./ToastNotification";
import { useToast } from "../context/ToastContext";

interface StackableToastsProps {};

export const StackableToasts: React.FC<StackableToastsProps> = () => {
  const { state: toasts } = useToast();
  if (!Array.isArray(toasts)) return null;
  if (toasts.length < 1) return null;

  return (
    <div className="flex flex-col items-end bg-transparent top-0 left-0 w-full max-h-1 fixed">
      {toasts.map((toast) => (
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
