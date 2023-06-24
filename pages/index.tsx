import React from "react";
import { useQRCode } from "next-qrcode";

import { useToast } from "@/src/context/ToastContext";
import { useModal } from "@/src/context/ModalContext";
import { useCopyToClipboard, useLocalStorage } from "@/src/hooks";
import ErrorBoundary from "@/src/components/ErrorBoundary";

import { BASE_URL, URL_REGEX } from "@/src/constants";
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

export default function Home() {
  const [urlData, setUrlData] = useLocalStorage<URLData[]>("urls", []);
  const [destinationUrl, setDestinationUrl] = React.useState<string>("");
  const [isLoading, setIsLoading] = React.useState(false);
  const { dispatchToast } = useToast();
  const { dispatchModal } = useModal();
  const [, copy] = useCopyToClipboard();
  const { Canvas: QRCodeCanvas } = useQRCode();

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
    const alreadyCreated = Array.isArray(urlData)
      ? urlData.filter((urlItem) => urlItem.destination === destinationUrl)
      : [];
    if (alreadyCreated.length) {
      dispatchToast("Link already created", "warning");
      return;
    }
    if (isLoading) return;
    setIsLoading(true);
    console.log('BASE_URL', BASE_URL, `${BASE_URL}/create-short-url?url=${destinationUrl}`);
    const response = await fetch(
      `${BASE_URL}/create-short-url?url=${destinationUrl}`,
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

  const handleOpenQRCodeModal = (urlItem: URLData) => {
    dispatchModal(
      "QR Code",
      <div className="flex items-center justify-center text-black p-4">
        <QRCodeCanvas text={urlItem.url} options={{ width: 300 }} />
      </div>
    );
  };

  const handleDeleteShortUrl = (urlItem: URLData) => {
    console.log('urlItem', urlItem);
    dispatchToast("Not implemented yet 🤫", "warning");
  }

  return (
    <main className="relative flex min-h-screen flex-col items-center p-2 bg-brand-green-200 pt-32">
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
        <React.Suspense>
          <ClientOnly>
            {Array.isArray(urlData) &&
              urlData.length > 0 &&
              urlData.map((urlItem) => (
                <ErrorBoundary name="url-list" key={urlItem.id}>
                  <div className="flex mt-2">
                    <div className="result-box flex w-full bg-brand-grayish-green-100 rounded-sm">
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
                            className="break-all w-full px-1 bg-white text-gray-500 rounded-sm"
                            defaultValue={urlItem.destination}
                            disabled={true}
                          />
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 w-16 min-w-[5rem] max-w-[5rem] items-center justify-between ml-auto border-l border-brand-grayish-green-200 p-2">
                        <button onClick={() => handleCopyUrl(urlItem)}>
                          <ClipboardIcon />
                        </button>
                        <button onClick={() => handleOpenQRCodeModal(urlItem)}>
                          <QRCodeIcon />
                        </button>
                      </div>
                    </div>
                    <button className="ml-1.5 px-1 bg-red-600 hover:bg-red-500" onClick={() => handleDeleteShortUrl(urlItem)}>
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
