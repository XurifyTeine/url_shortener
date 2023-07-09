import React from "react";
import { useQRCode } from "next-qrcode";
import Countdown from "react-countdown";
import { getCookie } from "cookies-next";
import { saveAs } from "file-saver";
import html2canvas from "html2canvas";

import { useToast } from "@/src/context/ToastContext";
import { useModal } from "@/src/context/ModalContext";
import { useCopyToClipboard } from "@/src/hooks";
import { truncateText } from "@/src/utils";
import { URLData, URLDataNextAPI } from "@/src/interfaces";

import ClipboardIcon from "@/src/components/Icons/ClipboardIcon";
import QRCodeIcon from "@/src/components/Icons/QRCodeIcon";
import TrashIcon from "@/src/components/Icons/TrashIcon";
import LoadingIcon from "@/src/components/Icons/LoadingIcon";
import { CountdownRenderer } from "@/src/components/Home/CountdownRender";

const ClientOnly = React.lazy(() =>
  import("@/src/components/ClientOnly").then((module) => ({
    default: module.ClientOnly,
  }))
);

export const UrlItem: React.FC<{
    urlData: URLData;
    urlsInDeletionProgress: { id: string; deleted: boolean; deleting: boolean }[];
    urls: URLData[];
    setUrlsInDeletionProgress: (
      urls: { id: string; deleted: boolean; deleting: boolean }[]
    ) => void;
    setUrlData: (urls: URLData[]) => void;
  }> = ({
    urlData,
    urls,
    urlsInDeletionProgress,
    setUrlsInDeletionProgress,
    setUrlData,
  }) => {
    const { dispatchToast } = useToast();
    const { dispatchModal } = useModal();
    const { Canvas: QRCodeCanvas } = useQRCode();
    const [, copy] = useCopyToClipboard();
    const ref = React.useRef<HTMLDivElement>(null);
    const [showFull, setShowFull] = React.useState(false);
  
    const isTryingToDelete = Boolean(
      urlsInDeletionProgress.find((url) => {
        return url.id === urlData.id && url.deleting === true;
      })
    );
  
    const handleCopyUrl = async (urlItem: URLData) => {
      const url = urlItem.url;
      if (url) {
        const result = await copy(url);
        result && dispatchToast("Successfully copied to clipboard", "copy");
      }
    };
  
    const handleDownloadQRCodeImage = () => {
      const container = ref.current;
  
      if (container) {
        html2canvas(container, {
          scale: 5,
          useCORS: true,
        }).then((canvas) => {
          canvas.toBlob((blob) => blob && saveAs(blob, "qr-code.png"));
        });
      }
    };
  
    const handleOpenQRCodeModal = (urlItem: URLData) => {
      dispatchModal(
        "QR Code",
        <div className="flex flex-col items-center justify-center text-black p-4">
          <div className="qr-code-canvas-wrapper" ref={ref}>
            <QRCodeCanvas text={urlItem.url} options={{ scale: 10 }} />
          </div>
          <button
            className="px-4 py-1 rounded-sm font-bold text-brand-dark-green-100 bg-brand-neon-green-100 hover:bg-brand-neon-green-200 disabled:bg-brand-neon-green-100 duration-200"
            onClick={handleDownloadQRCodeImage}
          >
            Download
          </button>
        </div>
      );
    };
  
    const handleDeleteShortUrl = async (
      selectedUrlItem: URLData,
      disabled: boolean
    ) => {
      if (disabled) return;
  
      const newUrlInDeletionProgress = {
        id: selectedUrlItem.id,
        deleted: false,
        deleting: true,
      };
      setUrlsInDeletionProgress([
        ...urlsInDeletionProgress,
        newUrlInDeletionProgress,
      ]);
      const sessionToken = getCookie("session_token");
      const url = sessionToken
        ? `/api/delete-url?id=${selectedUrlItem.id}&session_token=${sessionToken}`
        : `/api/delete-url?id=${selectedUrlItem.id}`;
      const response = await fetch(url, {
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        method: "DELETE",
      });
      const result: URLDataNextAPI = await response.json();
      const data = result?.result as URLData;
      if (data) {
        const newUrlsInDeletionProgress = urlsInDeletionProgress.filter(
          (url) => url.deleted === true
        );
  
        const newUrlInDeletionProgress = {
          id: selectedUrlItem.id,
          deleted: true,
          deleting: false,
        };
        setUrlsInDeletionProgress([
          ...newUrlsInDeletionProgress,
          newUrlInDeletionProgress,
        ]);
  
        const result = urls.filter((urlItem) => {
          if (selectedUrlItem.id === urlItem.id) return false;
          const found = urlsInDeletionProgress.find(
            (url) => url.id === urlItem.id
          );
          return found?.id !== urlItem.id;
        });
        setUrlData(result);
      }
    };
  
    return (
      <div className="flex mt-2">
        <div className="result-box flex w-full bg-brand-grayish-green-200 rounded-sm">
          <div className="flex flex-col w-full p-2">
            <span>
              <span className="mr-1.5">Click to visit:</span>
              <a
                className="text-brand-neon-green-100 break-all font-semibold"
                href={urlData.url}
                target="_blank"
              >
                {urlData.url}
              </a>
            </span>
            <span className="flex">
              <span className="mr-1.5">Destination:</span>
              <span
                className="break-all font-semibold cursor-pointer hover:text-brand-grayish-green-300"
                onClick={() => setShowFull(true)}
              >
                {showFull
                  ? urlData.destination
                  : truncateText(urlData.destination, 35)}
              </span>
            </span>
            {urlData.self_destruct && (
              <span className="flex">
                <React.Suspense>
                  <ClientOnly>
                    <Countdown
                      date={new Date(urlData.self_destruct)}
                      intervalDelay={0}
                      renderer={CountdownRenderer}
                    />
                  </ClientOnly>
                </React.Suspense>
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5 w-16 min-w-[5rem] max-w-[5rem] items-center justify-between ml-auto border-l border-brand-grayish-green-100 p-2">
            <button
              onClick={() => handleCopyUrl(urlData)}
              title="Copy to clipboard"
            >
              <ClipboardIcon />
            </button>
            <button
              onClick={() => handleOpenQRCodeModal(urlData)}
              title="Show QR Code"
            >
              <QRCodeIcon />
            </button>
          </div>
        </div>
        <button
          className="ml-1.5 px-1 bg-light-danger hover:bg-red-500"
          disabled={isTryingToDelete}
          onClick={() => handleDeleteShortUrl(urlData, isTryingToDelete)}
        >
          {isTryingToDelete ? <LoadingIcon /> : <TrashIcon />}
        </button>
      </div>
    );
  };
  