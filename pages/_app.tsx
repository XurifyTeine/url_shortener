import type { AppProps } from "next/app";
import "@/styles/globals.css";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <SafeHydrate>
      <Component {...pageProps} />;
    </SafeHydrate>
  );
}

const SafeHydrate: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <div suppressHydrationWarning>
      {typeof window === "undefined" ? null : children}
    </div>
  );
};
