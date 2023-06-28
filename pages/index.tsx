import React, { useState } from "react";
import { useQRCode } from "next-qrcode";
import setHours from "date-fns/setHours";
import setMinutes from "date-fns/setMinutes";

import { useToast } from "@/src/context/ToastContext";
import { useModal } from "@/src/context/ModalContext";
import { useCopyToClipboard, useLocalStorage } from "@/src/hooks";
import ErrorBoundary from "@/src/components/ErrorBoundary";

import { PRODUCTION_SITE_URL, SIXTY_SECONDS, URL_REGEX, selfDestructDurations } from "@/src/constants";
import { URLData, URLDataNextAPI } from "@/src/interfaces";

import LoadingIcon from "@/src/components/Icons/LoadingIcon";
import ClipboardIcon from "@/src/components/Icons/ClipboardIcon";
import QRCodeIcon from "@/src/components/Icons/QRCodeIcon";
import GitHubLink from "@/src/components/Icons/GitHubLink";
import TrashIcon from "@/src/components/Icons/TrashIcon";

const ClientOnly = React.lazy(() =>
  import("@/src/components/ClientOnly").then((module) => ({
    default: module.ClientOnly,
  }))
);

const DatePicker = React.lazy(() =>
  import("react-datepicker").then((module) => ({
    default: module.default,
  }))
);

import "react-datepicker/dist/react-datepicker.css";

export default function Home() {
  const [urlData, setUrlData] = useLocalStorage<URLData[]>("urls", []);
  const [destinationUrl, setDestinationUrl] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState<string | number>("");

  const { dispatchToast } = useToast();
  const { dispatchModal } = useModal();
  const [, copy] = useCopyToClipboard();
  const { Canvas: QRCodeCanvas } = useQRCode();

  const handleCreateShortURL = async (
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    e.preventDefault();
    if (destinationUrl.trim() === "") {
      dispatchToast("Please enter in a URL", "warning", 5000);
      return;
    } else if (!URL_REGEX.test(destinationUrl)) {
      dispatchToast("This is not a vaid URL", "danger", 5000);
      return;
    }
    const productionSiteUrled = new URL(PRODUCTION_SITE_URL);
    const destinationSiteUrled = new URL(destinationUrl);
    if (productionSiteUrled.hostname === destinationSiteUrled.hostname) {
      dispatchToast("You cannot shorten this domain", "warning", 5000);
      return;
    }
    const alreadyCreated = Array.isArray(urlData)
      ? urlData.filter((urlItem) => urlItem.destination === destinationUrl)
      : [];
    if (alreadyCreated.length) {
      dispatchToast("Link already created", "warning");
      return;
    }
    if (isLoading) return;
    setIsLoading(true);

    const url = selectedDuration
      ? `/api/urls?destination=${destinationUrl}&self_destruct=${selectedDuration}`
      : `/api/urls?destination=${destinationUrl}`;
    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      method: "POST",
    });
    const result: URLDataNextAPI = await response.json();
    const data = result?.result as URLData;

    if (result?.error) {
      const toastText =
        typeof result.error === "string"
          ? result.error
          : "Creating Short URL Error";
      dispatchToast(toastText, "danger", 7000);
      console.error("Creating Short URL Error:", result.error);
      setIsLoading(false);
    } else if (data) {
      const newUrlData: URLData = {
        date_created: data.date_created,
        destination: data.destination,
        id: data.id,
        url: `${window.location.origin}/${data.id}`,
        self_destruct: data.self_destruct,
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

  const handleOnChangePassword = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
  };

  const handleCopyUrl = async (urlItem: URLData) => {
    const url = urlItem.url;
    if (url) {
      const result = await copy(url);
      result && dispatchToast("Successfully copied to clipboard", "copy");
    }
  };

  const handleOpenQRCodeModal = (urlItem: URLData) => {
    dispatchModal(
      "QR Code",
      <div className="flex items-center justify-center text-black p-4">
        <QRCodeCanvas text={urlItem.url} options={{ width: 300 }} />
      </div>
    );
  };

  const handleDeleteShortUrl = async (urlItem: URLData) => {
    //dispatchToast("Not implemented yet 🤫", "warning");

    const response = await fetch(`/api/delete-url?id=${urlItem.id}`, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      method: "DELETE",
    });
    const result: URLDataNextAPI = await response.json();
    const data = result?.result as URLData;
    if (data) {
      const newUrlData = urlData.filter((item) => item.id !== urlItem.id);
      setUrlData(newUrlData);
    }
  };

  const handleDurationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newDuration = e.target.value;
    setSelectedDuration(newDuration);
  };

  const handleToggleShowAdvanced = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setShowAdvanced(!showAdvanced);
  };

  return (
    <main className="relative min-h-screen flex flex-col items-center p-2 bg-brand-green-200 pt-32">
      <h1 className="text-white text-4xl uppercase mb-5 font-bold">
        URL Shortener
      </h1>
      <div className="items-center justify-center rounded-sm w-full md:max-w-xl p-6 bg-brand-green-300 shadow">
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
                  className="caret-zinc-900 h-12 py-2 px-3 bg-white text-gray-600 w-full focus:outline-none placeholder:text-gray-400"
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
          <div className="mt-2 w-full">
            <button
              className="bg-brand-grayish-green-300 text-white w-32 px-2 py-0.5 rounded-sm flex items-center justify-between"
              onClick={handleToggleShowAdvanced}
            >
              Advanced{" "}
              <span className={showAdvanced ? "rotate-180" : undefined}>
                <ChevronIcon />
              </span>
            </button>
            {showAdvanced && (
              <div className="w-full flex mt-2">
                <div className="text-black">
                  <select
                    id="durations"
                    onChange={handleDurationChange}
                    className="bg-gray-50 px-2 w-36 border border-gray-300 text-gray-900 text-sm rounded-sm focus:ring-blue-500 focus:border-blue-500 block w-full h-full"
                  >
                    {
                      selfDestructDurations.map((duration) => (
                        <option key={duration.label} value={duration.value}>{duration.label}</option>
                      ))
                    }
                  </select>
                </div>
                <input
                  className="h-8 py-2 px-3 ml-2 bg-white rounded-sm text-gray-600 w-full focus:outline-none placeholder:text-gray-400"
                  value={password}
                  onChange={handleOnChangePassword}
                  id="password"
                  type="password"
                  placeholder="Password"
                />
              </div>
            )}
          </div>
        </form>
        <React.Suspense>
          <ClientOnly>
            {Array.isArray(urlData) &&
              urlData.length > 0 &&
              urlData.map((urlItem) => (
                <ErrorBoundary name="url-list" key={urlItem.id}>
                  <div className="flex mt-2">
                    <div className="result-box flex w-full bg-brand-grayish-green-200 rounded-sm">
                      <div className="flex flex-col w-full p-2">
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
                        <span className="flex">
                          <span className="mr-1.5">Destination:</span>
                          <input
                            className="break-all w-full px-1 bg-brand-green-400 text-gray-500 rounded-sm"
                            defaultValue={urlItem.destination}
                            disabled={true}
                          />
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 w-16 min-w-[5rem] max-w-[5rem] items-center justify-between ml-auto border-l border-brand-grayish-green-100 p-2">
                        <button
                          onClick={() => handleCopyUrl(urlItem)}
                          title="Copy to clipboard"
                        >
                          <ClipboardIcon />
                        </button>
                        <button
                          onClick={() => handleOpenQRCodeModal(urlItem)}
                          title="Show QR Code"
                        >
                          <QRCodeIcon />
                        </button>
                      </div>
                    </div>
                    <button
                      className="ml-1.5 px-1 bg-light-danger hover:bg-red-500"
                      onClick={() => handleDeleteShortUrl(urlItem)}
                    >
                      <TrashIcon />
                    </button>
                  </div>
                </ErrorBoundary>
              ))}
          </ClientOnly>
        </React.Suspense>
        <p className="mt-2 text-brand-dark-green-100">
          Experience the magically URL shortening powers of{" "}
          <span className="font-bold">NoLongr</span>. This tool will help you to
          create shortened links, making it easier than ever to share and
          engage. Enjoy the convenience of quick and concise links that are easy
          to share.
        </p>
      </div>
      <GitHubLink />
    </main>
  );
}

function ChevronIcon() {
  return (
    <svg
      className="w-6 h-6"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
    >
      <path d="M12 8l6 6H6l6-6z" fill="#FFFFFF"></path>
    </svg>
  );
}
