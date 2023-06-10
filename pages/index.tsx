import React from "react";

import { URLData } from "@/src/interfaces";
import LoadingIcon from "@/src/components/LoadingIcon";
import { useToast } from "@/src/context/ToastContext";
import { URLDataNextAPI } from "./api/create-short-url";
import { useCopyToClipboard } from "@/src/hooks";
import ErrorBoundary from "@/src/components/ErrorBoundary";
import { URL_REGEX } from "@/src/constants";

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
    <main className="flex min-h-screen flex-col items-center p-2 bg-brand-green-200 pt-32">
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
                <div className="flex w-16 min-w-[4rem] max-w-[4rem] items-center justify-center ml-auto">
                  <button onClick={() => handleCopyUrl(urlItem)}>
                    <ClipboardIcon />
                  </button>
                  <button
                    className="ml-2"
                    onClick={() => handleCopyUrl(urlItem)}
                  >
                    <QRCodeIcon />
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

const QRCodeIcon = () => {
  return (
    <svg
      className="w-5 h-5"
      xmlns="http://www.w3.org/2000/svg"
      version="1.1"
      viewBox="0 0 308.667 308.667"
      xmlSpace="preserve"
    >
      <g fill="#ffffff">
        <path d="M38.073 38.073H85.66499999999999V85.66499999999999H38.073z"></path>
        <path d="M38.073 223.002H85.66499999999999V270.594H38.073z"></path>
        <path d="M0 163.852v144.815h123.739v-66.629h28.555v65.269h34.674v-28.555h27.195v28.555h34.674v-32.634h25.156v32.634h34.674v-34.674h-32.634v-32.634h-34.674v32.634H218.58v-67.308h-31.612V176.77h32.634v32.634h34.674v-21.756h19.717V236.6h34.674v-50.991h-21.756v-30.595h21.756V0H184.928v.228h-32.634v37.845h-28.555V0H0v144.135h21.756v19.717H0zm101.982 123.059H21.756v-80.226h80.226v80.226zm52.351-77.507h29.578v30.595h-29.578v-30.595zm0-65.269h27.533v30.595h-27.533v-30.595zm119.66 8.839h-18.7v-10.878h-68.326v-18.357h87.025v29.235zM206.684 21.756h80.226v80.226h-80.226V21.756zm-21.756 87.705h-30.595v-67.76h30.595v67.76zm-32.634 32.635h-28.468v-30.595h28.468v30.595zM21.756 21.756h80.226v80.226H21.756V21.756zm67.396 101.983v20.396h30.508v32.634h32.634v30.595h-28.555v-22.436H34.674v-8.159h54.391v-34.674H34.674v-18.357h54.478z"></path>
        <path d="M223.002 38.073H270.594V85.66499999999999H223.002z"></path>
      </g>
    </svg>
  );
};
