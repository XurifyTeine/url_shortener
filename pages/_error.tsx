import React from "react";
import { NextPage } from "next";
import { Nunito } from "next/font/google";
import Link from "next/link";

const inter = Nunito({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800", "900"],
  fallback: ["ui-sans-serif"],
});

interface ErrorPageProps {
  statusCode?: number;
  errorMessage?: string | null;
}

const Error: NextPage<ErrorPageProps> = ({ statusCode, errorMessage }) => {
  return (
    <main
      className="flex min-h-screen flex-col items-center p-2 bg-brand-green-200 justify-center text-center"
      style={inter.style}
    >
      <h1 className="font-bold text-8xl">{statusCode}</h1>
      <h2 className="font-light text-3xl">
        Sorry, it looks like this link is broken 😥
      </h2>
      {errorMessage && <span>{errorMessage}</span>}
      <Link
        href="/"
        className="h-6 p-5 mt-5 bg-white text-black flex items-center justify-center rounded hover:bg-gray-200 duration-200"
      >
        <span>Back to Home</span>
      </Link>
    </main>
  );
};

Error.getInitialProps = async ({ res, err }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode, errorMessage: err?.message ?? null };
};

export default Error;
