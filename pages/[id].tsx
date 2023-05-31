import React from "react";
import { Nunito } from "next/font/google";
import Link from "next/link";
import { URLError, URLDataResponse } from "@/src/interfaces";
import { getIdFromPathname } from "@/src/utils";
import { URLDataNextAPI } from "./api/create-short-url";

const inter = Nunito({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800", "900"],
  fallback: ["ui-sans-serif"],
});

export default function RedirectPage() {
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  React.useEffect(() => {
    const id = getIdFromPathname(window.location.pathname);
    if (!id) return;

    (async () => {
      const response = await fetch(`/api/urls/LjjdON`, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        method: "GET",
      });
      const result: URLDataNextAPI = await response.json();
      if (result?.error) {
        setErrorMessage(result.error);
      } else if (result.result?.destination) {
        window.location.replace(result.result.destination)
      }
    })();
  }, []);

  return (
    <main
      className="flex min-h-screen flex-col items-center p-2 bg-brand-green-200 justify-center text-center"
      style={inter.style}
    >
      <h1 className="font-bold text-8xl">404</h1>
      <h2 className="font-light text-3xl">
        Sorry, it looks like this link is broken 😥
      </h2>
      {errorMessage && <span>{errorMessage}</span>}
      <Link href="/" className="h-6 p-5 mt-5 bg-white text-black flex items-center justify-center rounded hover:bg-gray-200 duration-200">
        <span>Back to Home</span>
      </Link>
    </main>
  );
}
