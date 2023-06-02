import React from "react";
import { ImageResponse } from "@vercel/og";

export const config = {
  runtime: "edge",
};

const Icon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    xmlSpace="preserve"
    style={{
      fillRule: "evenodd",
      clipRule: "evenodd",
      strokeLinecap: "round",
      strokeLinejoin: "round",
    }}
    viewBox="0 0 500 500"
  >
    <path
      d="M-.501 4.008h500v493.988h-500z"
      style={{
        fill: "#99a98f",
      }}
      transform="matrix(1.002 0 0 1.01838 -1.001 -5.144)"
    />
    <path
      d="M10 13a5.003 5.003 0 0 0 7.54.54l3-3a5.003 5.003 0 0 0 1.404-3.474c0-2.742-2.258-5-5-5A5.003 5.003 0 0 0 13.47 3.47l-1.72 1.71"
      style={{
        fill: "none",
        fillRule: "nonzero",
        stroke: "#fff",
        strokeWidth: 2,
      }}
      transform="translate(94.137 94.137) scale(12.9886)"
    />
    <path
      d="M14 11a5.003 5.003 0 0 0-7.54-.54l-3 3a5.003 5.003 0 0 0-1.404 3.474c0 2.742 2.258 5 5 5a5.003 5.003 0 0 0 3.474-1.404l1.71-1.71"
      style={{
        fill: "none",
        fillRule: "nonzero",
        stroke: "#fff",
        strokeWidth: 2,
      }}
      transform="translate(94.137 94.137) scale(12.9886)"
    />
  </svg>
);

export default function () {
  return new ImageResponse(Icon, {
    width: 500,
    height: 500,
  });
}
