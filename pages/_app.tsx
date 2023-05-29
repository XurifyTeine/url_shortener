import type { AppProps } from "next/app";
import { ToastProvider } from "react-toast-notifications";
import "@/styles/globals.css";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ToastProvider
      autoDismiss
      autoDismissTimeout={600000}
      placement="top-right"
    >
      <Component {...pageProps} />
    </ToastProvider>
  );
}
