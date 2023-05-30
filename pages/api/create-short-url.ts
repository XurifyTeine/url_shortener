// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { BASE_URL } from "@/src/constants";
import { URLDataResponse } from "@/src/interfaces";
import type { NextApiRequest, NextApiResponse } from "next";
import NextCors from "nextjs-cors";

interface URLData {
  destination: string;
  id: string;
  date_created: string;
}

export type Data = {
  result?: URLData;
  message?: string;
  error?: string;
};

const handleFetch = async (destination: string): Promise<URLDataResponse> => {
  const url = `${BASE_URL}/create-short-url?url=${destination}`;
  const res = await fetch(url, {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    method: "POST",
  });
  const data = await res.json();
  return data;
};

export const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<Data>
) => {
  if (req.method !== "POST") {
    res.status(405).send({ message: "Only POST requests allowed" });
    return;
  }

  const destination = req.query["url"] as string | undefined;

  if (destination) {
    const urlData = await handleFetch(destination);
    if (urlData?.result) {
      res.status(200).json({ result: urlData.result });
    }
  }

  res.status(404).send({
    error:
      "Something went wrong. There was possibly no destination URL provided",
  });
};

export default handler;
