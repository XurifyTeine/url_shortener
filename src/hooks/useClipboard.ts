import React from "react";

type CopiedValue = string | null;
type CopyFn = (text: string) => Promise<boolean>;

export const useCopyToClipboard = (): [CopiedValue, CopyFn] => {
  const [copiedText, setCopiedText] = React.useState<CopiedValue>(null);

  const copy: CopyFn = async (text) => {
    if (!navigator?.clipboard) {
      console.warn("Clipboard not supported");
      const fallbackResult = copyToClipboardFallback(text);
      return false || fallbackResult;
    }

    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(text);
      return true;
    } catch (error) {
      console.warn("Copy failed", error);
      setCopiedText(null);
      return false;
    }
  };

  return [copiedText, copy];
};

const copyToClipboardFallback = (text: string): boolean => {
  const el = document.createElement("textarea");

  el.value = text;
  el.setAttribute("readonly", "");
  el.style.position = "absolute";
  el.style.left = "-9999px";
  document.body.appendChild(el);
  const selected =
    (document.getSelection() as Selection).rangeCount > 0
      ? document.getSelection() &&
        (document.getSelection() as Selection).getRangeAt(0)
      : false;
  el.select();
  const success = document.execCommand("copy");
  document.body.removeChild(el);
  if (selected && document.getSelection()) {
    (document.getSelection() as Selection).removeAllRanges();
    (document.getSelection() as Selection).addRange(selected);
  }
  return success;
};

export default useCopyToClipboard;
