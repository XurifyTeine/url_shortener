import React, { useState } from "react";
import { GetServerSideProps } from "next";

import { useToast } from "@/src/context/ToastContext";
import { useLocalStorage } from "@/src/hooks";
import ErrorBoundary from "@/src/components/ErrorBoundary";

import {
  BASE_URL,
  PRODUCTION_SITE_URL,
  URL_REGEX,
  selfDestructDurations,
} from "@/src/constants";
import { URLData, URLDataNextAPI } from "@/src/interfaces";

import LoadingIcon from "@/src/components/Icons/LoadingIcon";
import GitHubLink from "@/src/components/Icons/GitHubLink";
import ChevronIcon from "@/src/components/Icons/ChevronIcon";
import { UrlItem } from "@/src/components/Home/UrlItem";

interface HomeProps {
  userUrls: URLData[];
}

export const Home: React.FC<HomeProps> = ({ userUrls }) => {
  const [urlData, setUrlData] = useLocalStorage<URLData[]>("urls", userUrls);
  const [destinationUrl, setDestinationUrl] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState<string | number>("");
  const [urlsInDeletionProgress, setUrlsInDeletionProgress] = useState<
    { id: string; deleted: boolean; deleting: boolean }[]
  >([]);

  const { dispatchToast } = useToast();

  React.useEffect(() => {
    setUrlData(userUrls);
  }, []);

  const handleCreateShortURL = async () => {
    if (destinationUrl.trim() === "") {
      dispatchToast("Please enter in a URL", "warning");
      return;
    } else if (!URL_REGEX.test(destinationUrl)) {
      dispatchToast("This is not a vaid URL", "danger");
      return;
    }
    const productionSiteUrled = new URL(PRODUCTION_SITE_URL);
    const destinationSiteUrled = new URL(destinationUrl);
    if (productionSiteUrled.hostname === destinationSiteUrled.hostname) {
      dispatchToast("You cannot shorten this domain", "warning");
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
      credentials: "include",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({
        password,
      }),
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
      const BASE_URL =
        process.env.NODE_ENV === "production"
          ? "https://nolongr.vercel.app"
          : "http://localhost:3000";
      const newUrlData: URLData = {
        date_created: data.date_created,
        destination: data.destination,
        id: data.id,
        url: `${BASE_URL}/${data.id}`,
        self_destruct: data.self_destruct,
      };
      setUrlData([newUrlData, ...(urlData ?? [])]);
      setIsLoading(false);
    }
  };

  const handleClickCreateShortURL = (
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    e.preventDefault();
    handleCreateShortURL();
  };

  const handleKeyDownCreateShortURL = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Enter") {
      handleCreateShortURL();
    }
  };

  const handleChangeDestinationUrl = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    setDestinationUrl(value);
  };

  const handleChangePassword = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
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
                  onChange={handleChangeDestinationUrl}
                  onKeyDown={handleKeyDownCreateShortURL}
                  id="url"
                  placeholder="Paste a link here"
                />
              </ErrorBoundary>
            </div>
            <button
              className="flex items-center justify-center rounded-r-sm px-2 whitespace-nowrap h-12 w-full md:w-44 mt-2 md:mt-0 font-bold text-brand-dark-green-100 bg-brand-neon-green-100 hover:bg-brand-neon-green-200 disabled:bg-brand-neon-green-100 duration-200"
              onClick={handleClickCreateShortURL}
              disabled={isLoading}
            >
              {isLoading && (
                <span className="mr-2">
                  <LoadingIcon />
                </span>
              )}
              {isLoading ? "Loading..." : "Shorten URL"}
            </button>
          </span>
          <div className="mt-2 w-full">
            <button
              className="bg-brand-grayish-green-300 text-white w-32 px-2 py-0.5 rounded-sm flex items-center justify-between"
              onClick={handleToggleShowAdvanced}
            >
              Advanced
              <span className={showAdvanced ? "rotate-180" : undefined}>
                <ChevronIcon />
              </span>
            </button>
            {showAdvanced && (
              <div className="w-full flex flex-col sm:flex-row mt-2 gap-2">
                <div className="text-black">
                  <select
                    id="durations"
                    onChange={handleDurationChange}
                    className="bg-gray-50 px-2 w-full sm:w-40 h-8 border border-gray-300 text-gray-900 text-sm rounded-sm focus:ring-blue-500 focus:border-blue-500 block"
                  >
                    {selfDestructDurations.map((duration) => (
                      <option key={duration.label} value={duration.value}>
                        {duration.label}
                      </option>
                    ))}
                  </select>
                </div>
                <input
                  className="h-8 py-2 px-3 bg-white rounded-sm text-gray-600 w-full focus:outline-none placeholder:text-gray-400"
                  value={password}
                  onChange={handleChangePassword}
                  id="password"
                  type="password"
                  placeholder="Password"
                />
              </div>
            )}
          </div>
        </form>
        {Array.isArray(urlData) &&
          urlData.length > 0 &&
          urlData.map((urlItem) => {
            return (
              <ErrorBoundary name="url-list" key={urlItem.id}>
                <UrlItem
                  urlData={urlItem}
                  urlsInDeletionProgress={urlsInDeletionProgress}
                  urls={urlData}
                  setUrlsInDeletionProgress={setUrlsInDeletionProgress}
                  setUrlData={setUrlData}
                />
              </ErrorBoundary>
            );
          })}
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
};

export default Home;

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const sessionToken = req.cookies["session_token"];

  if (sessionToken) {
    const url = `${BASE_URL}/user-session-urls?session_token=${sessionToken}`;

    const urlDataRequest = await fetch(url, {
      credentials: "include",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      method: "GET",
    });

    const urlDataResponse = await urlDataRequest.json();

    const result = urlDataResponse?.result;

    const props: HomeProps = {
      userUrls: Array.isArray(result) ? result : [],
    };

    return {
      props,
    };
  }
  return { props: {} };
};
