import React from "react";
import { useToast } from "../context/ToastContext";
import { useTimeout } from "../hooks/useTimeout";

export type ToastNotificationType =
  | "default"
  | "success"
  | "danger"
  | "warning"
  | "copy";

export interface ToastNotificationProps {
  id: string;
  message: string;
  type: ToastNotificationType;
  duration: number;
}

export const ToastNotification: React.FC<ToastNotificationProps> = ({
  id,
  message,
  type,
  duration = 5000,
}) => {
  const { dismissToast, state: toastsState } = useToast();
  const firstToast = toastsState?.[0];
  const marginTop = id === firstToast.id ? "mt-0" : `mt-[-3rem]`;
  const defaultClassName = `animate-slide-in ${marginTop} toasts-state-${toastsState.length} relative right-2 top-2 flex items-center max-w-xs w-full p-4 text-gray-500 bg-white rounded-lg shadow`;
  const [className, setClassName] = React.useState(defaultClassName);
  const toastType = `toast-${type}-${id}`;

  const toastIds: string[] = toastsState.map((toast) => toast.id);

  React.useEffect(() => {
    setClassName(defaultClassName);
  }, [defaultClassName]);

  const handleDismissToast = React.useCallback(() => {
    setClassName(`${defaultClassName} animate-slide-out`);
    setTimeout(() => {
      dismissToast(id);
    }, 270);
  }, [id, defaultClassName]);

  useTimeout(handleDismissToast, duration + 270);

  const icon =
    type === "success" ? (
      <SuccessIcon />
    ) : type === "danger" ? (
      <DangerIcon />
    ) : type === "warning" ? (
      <WarningIcon />
    ) : type === "copy" ? (
      <ClipboardIcon />
    ) : (
      <DefaultIcon />
    );

  if (!toastIds.includes(id)) return null;

  return (
    <div id={toastType} className={className} role="alert">
      {icon}
      <div className="ml-3 text-sm font-normal">{message}</div>
      <button
        type="button"
        className="ml-auto -mx-1.5 -my-1.5 ml-2 bg-white text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex h-8 w-8"
        data-dismiss-target={`#${id}`}
        aria-label="Close"
        onClick={() => handleDismissToast()}
      >
        <span className="sr-only">Close</span>
        <svg
          aria-hidden="true"
          className="w-5 h-5"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
            clipRule="evenodd"
          ></path>
        </svg>
      </button>
    </div>
  );
};

const ClipboardIcon: () => React.JSX.Element = () => (
  <div className="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 text-green-500 bg-green-100 rounded-lg">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="#ffffff"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
    </svg>
    <span className="sr-only">Fire icon</span>
  </div>
);

const DefaultIcon: () => React.JSX.Element = () => (
  <div className="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 text-blue-500 bg-blue-100 rounded-lg">
    <svg
      aria-hidden="true"
      className="w-5 h-5"
      fill="currentColor"
      viewBox="0 0 20 20"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z"
        clipRule="evenodd"
      ></path>
    </svg>
    <span className="sr-only">Fire icon</span>
  </div>
);

const SuccessIcon: () => React.JSX.Element = () => (
  <div className="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 text-green-500 bg-green-100 rounded-lg">
    <svg
      aria-hidden="true"
      className="w-5 h-5"
      fill="currentColor"
      viewBox="0 0 20 20"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
        clipRule="evenodd"
      ></path>
    </svg>
    <span className="sr-only">Check icon</span>
  </div>
);

const DangerIcon: () => React.JSX.Element = () => (
  <div className="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 text-red-500 bg-red-100 rounded-lg">
    <svg
      aria-hidden="true"
      className="w-5 h-5"
      fill="currentColor"
      viewBox="0 0 20 20"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
        clipRule="evenodd"
      ></path>
    </svg>
    <span className="sr-only">Error icon</span>
  </div>
);

const WarningIcon: () => React.JSX.Element = () => (
  <div className="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 text-orange-500 bg-orange-100 rounded-lg">
    <svg
      aria-hidden="true"
      className="w-5 h-5"
      fill="currentColor"
      viewBox="0 0 20 20"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
        clipRule="evenodd"
      ></path>
    </svg>
    <span className="sr-only">Warning icon</span>
  </div>
);

export default ToastNotification;
