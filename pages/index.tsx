import React from "react";
import { Nunito } from "next/font/google";

import { URLData } from "@/src/interfaces";
import LoadingIcon from "@/src/components/LoadingIcon";
import { useToast } from "@/src/context/ToastContext";
import { URLDataNextAPI } from "./api/create-short-url";
import { useCopyToClipboard } from "@/src/hooks";
import ErrorBoundary from "@/src/components/ErrorBoundary";
import { URL_REGEX } from "@/src/constants";

const inter = Nunito({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800", "900"],
  fallback: ["ui-sans-serif"],
});

export default function Home() {
  const [urlData, setUrlData] = React.useState<URLData[]>([]);
  const [destinationUrl, setDestinationUrl] = React.useState<string>("");
  const [isLoading, setIsLoading] = React.useState(false);
  const { dispatchToast } = useToast();
  const [, copy] = useCopyToClipboard();

  const handleCreateShortURL = async (
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    e.preventDefault();
    if (destinationUrl.trim() === "") {
      dispatchToast("Please enter in a URL", "danger", 5000);
      return;
    }
    if (!URL_REGEX.test(destinationUrl)) {
      dispatchToast("This is not a vaid URL", "danger", 5000);
      return;
    }
    const alreadyCreated = urlData.filter(
      (urlItem) => urlItem.destination === destinationUrl
    );
    if (alreadyCreated.length) {
      dispatchToast("Link already created", "warning");
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
    const result: URLDataNextAPI = await response.json();
    const data = result?.result as URLData;

    if (result?.error) {
      dispatchToast(result.error, "danger", 7000);
      console.error("Creating Short URL Error:", result.error);
      setIsLoading(false);
    } else if (data) {
      const newUrlData: URLData = {
        date_created: data.date_created,
        destination: data.destination,
        id: data.id,
        url: `${window.location.origin}/${data.id}`,
      };
      setUrlData([...(urlData ?? []), newUrlData]);
      setIsLoading(false);
    }
  };

  const handleOnChangeDestinationUrl = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    setDestinationUrl(value);
  };

  const handleCopyUrl = async (urlItem: URLData) => {
    const url = urlItem.url;
    if (url) {
      const result = await copy(url);
      result && dispatchToast("Successfully copied to clipboard", "copy");
    }
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
            <div className="w-full relative">
              <ErrorBoundary name="url-input">
                <input
                  className="h-12 py-2 px-3 bg-white text-gray-600 w-full focus:outline-none placeholder:text-gray-400"
                  value={destinationUrl}
                  onChange={handleOnChangeDestinationUrl}
                  id="url"
                  placeholder="Paste a link here"
                />
              </ErrorBoundary>
            </div>
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
        {urlData.length > 0 &&
          typeof window !== "undefined" &&
          urlData.map((urlItem) => (
            <ErrorBoundary name="url-list" key={urlItem.id}>
              <div className="result-box flex bg-brand-grayish-green-100 rounded-sm mt-2 p-2">
                <div className="flex flex-col">
                  <span>
                    <span className="mr-1.5">Click to visit:</span>
                    <a
                      className="text-brand-neon-green-100 break-all font-semibold"
                      href={urlItem.url}
                      target="_blank"
                    >
                      {urlItem.url}
                    </a>
                  </span>
                  <span>
                    <span className="mr-1.5">Destination:</span>
                    <a
                      className="mb-1.5 break-all"
                      href={urlItem.destination}
                      target="_blank"
                    >
                      {urlItem.destination}
                    </a>
                  </span>
                </div>
                <div className="flex w-16 min-w-[4rem] max-w-[4rem] items-center justify-center">
                  <button onClick={() => handleCopyUrl(urlItem)}>
                    <ClipboardIcon />
                  </button>
                </div>
              </div>
            </ErrorBoundary>
          ))}
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

const ClipboardIcon = () => (
  <svg
    className="w-6 h-6"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
  >
    <path
      d="M6 4V8H18V4H20.0066C20.5552 4 21 4.44495 21 4.9934V21.0066C21 21.5552 20.5551 22 20.0066 22H3.9934C3.44476 22 3 21.5551 3 21.0066V4.9934C3 4.44476 3.44495 4 3.9934 4H6ZM8 2H16V6H8V2Z"
      fill="rgba(252,249,249,1)"
    ></path>
  </svg>
);
