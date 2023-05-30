import React from "react";
import { Nunito } from "next/font/google";
import Link from "next/link";
import { URLError, URLDataResponse } from "@/src/interfaces";
import { getIdFromPathname } from "@/src/utils";
import { GitHubLink } from "@/src/components/GitHubLink";

const inter = Nunito({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800", "900"],
  fallback: ["ui-sans-serif"],
});

export default function RedirectPage() {
  const [errorMessage, setErrorMessage] = React.useState<URLError | null>(null);

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
      const result = await response.json();
      const data: URLDataResponse = result.data;
      if (data.error) {
        setErrorMessage(data.error);
      } else if (data.result?.destination) {
        window.location.replace(data.result.destination)
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
      {errorMessage && <span>{errorMessage.message}</span>}
      <Link href="/" className="h-6 p-5 mt-5 bg-white text-black flex items-center justify-center rounded hover:bg-gray-200 duration-200">
        <span>Back to Home</span>
      </Link>
      <GitHubLink />
    </main>
  );
}
