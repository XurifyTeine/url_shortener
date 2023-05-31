// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { BASE_URL } from "@/src/constants";
import { URLDataResponse } from "@/src/interfaces";
import type { NextApiRequest, NextApiResponse } from "next";

interface URLData {
  destination: string;
  id: string;
  date_created: string;
}

export type URLDataNextAPI = {
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
  res: NextApiResponse<URLDataNextAPI>
) => {
  const destination = req.query["url"] as string | undefined;

  if (destination) {
    const result = await handleFetch(destination);
    if (result?.error && result.error.errorCode) {
      res.status(result.error.errorCode ?? 404).json({ error: result.error?.message });
      return;
    } else if (result?.result) {
      res.status(200).json({ result: result.result })
      return;
    }
  }


  res.status(404).send({
    error:
      "Something went wrong. There was possibly no destination URL provided",
  });
};

export default handler;
