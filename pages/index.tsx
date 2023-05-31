import React from "react";
import { Nunito } from "next/font/google";

import { URLData, URLDataResponse } from "@/src/interfaces";
import LoadingIcon from "@/src/components/LoadingIcon";
import { useToast } from "@/src/context/ToastContext";

const inter = Nunito({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800", "900"],
  fallback: ["ui-sans-serif"],
});

export default function Home() {
  const [urlData, setUrlData] = React.useState<URLData | null>(null);
  const [destinationUrl, setDestinationUrl] = React.useState<string>("");
  const [isLoading, setIsLoading] = React.useState(false);
  const { dispatchToast } = useToast();

  const handleCreateShortURL = async (
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    e.preventDefault();
    if (destinationUrl.trim() === "") {
      dispatchToast("An incorrect URL was provided", "danger");
      return;
    }
    if (isLoading) return;
    setIsLoading(true);
    const response = await fetch(
      `/api/create-short-url?url=${destinationUrl}`,
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        method: "POST",
      }
    );
    const result: URLDataResponse = await response.json();
    const data = result?.result as URLData;

    if (result?.error) {
      dispatchToast(result.error.message, "danger");
      console.error("Creating Short URL Error:", result.error);
      setIsLoading(false);
    } else if (data) {
      const newUrlData: URLData = {
        date_created: data.date_created,
        destination: data.destination,
        id: data.id,
        url: `${window.location.origin}/${data.id}`,
      };
      setUrlData(newUrlData);
      setIsLoading(false);
    }
  };

  const handleOnChangeDestinationUrl = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    setDestinationUrl(value);
  };

  return (
    <main
      className="flex min-h-screen flex-col items-center p-2 bg-brand-green-200 pt-32"
      style={inter.style}
    >
      <h1 className="text-white text-4xl uppercase mb-5 font-bold">
        URL Shortener
      </h1>
      <div className="items-center justify-center rounded-sm w-full md:max-w-lg p-6 min-h-32 bg-brand-green-300 shadow">
        <form className="flex flex-col items-center justify-center w-full">
          <label
            className="mr-2 text-black mb-2 text-xl uppercase font-semibold text-brand-dark-green-200"
            htmlFor="url"
          >
            Shorten a long URL
          </label>
          <span className="flex flex-wrap md:flex-nowrap rounded-sm overflow-hidden block w-full">
            <input
              className="h-12 py-2 px-3 bg-white text-gray-600 w-full focus:outline-none placeholder:text-gray-400"
              value={destinationUrl}
              onChange={handleOnChangeDestinationUrl}
              id="url"
              placeholder="Paste a link here"
            />
            <button
              className="flex items-center justify-center text-brand-dark-green-100 rounded-r-sm h-12 w-full md:w-44 mt-2 md:mt-0 font-bold bg-brand-neon-green-100 hover:bg-brand-neon-green-200 disabled:bg-brand-neon-green-100 duration-200"
              onClick={handleCreateShortURL}
              disabled={isLoading}
            >
              {isLoading && <LoadingIcon />}{" "}
              {isLoading ? "Loading..." : "Shorten URL"}
            </button>
          </span>
        </form>
        {urlData && typeof window !== "undefined" && (
          <div className="result-box flex flex-col bg-brand-grayish-green-100 rounded-sm mt-2 p-2">
            <span>
              <span className="mr-1.5">Click to visit:</span>
              <a
                className="text-brand-neon-green-100 break-all font-semibold"
                href={`/${urlData.url}`}
                target="_blank"
              >
                {urlData.url}
              </a>
            </span>
            <span>
              <span className="mr-1.5">Destination:</span>
              <a
                className="mb-1.5 break-all"
                href={urlData.destination}
                target="_blank"
              >
                {urlData.destination}
              </a>
            </span>
          </div>
        )}
        <p className="mt-2 text-brand-dark-green-100">
          Experience the magically URL shortening powers of{" "}
          <span className="font-bold">NoLongr</span>. This tool will help you to
          create shortened links, making it easier than ever to share and
          engage. Enjoy the convenience of quick and concise links that are easy
          to share.
        </p>
      </div>
    </main>
  );
}
