import type { NextApiRequest, NextApiResponse } from 'next'

import { BASE_URL } from '@/src/constants';
import { URLDataResponse } from '@/src/interfaces';
import { URLDataNextAPI } from '../create-short-url';

const handleFetch = async (urlId: string): Promise<URLDataResponse> => {
  const url = `${BASE_URL}/urls/${urlId}`;
  const res = await fetch(url, {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    method: "GET",
  });
  const data = await res.json();
  return data;
};

export const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<URLDataNextAPI>
) => {
  const urlId = req.query["id"] as string | undefined;

  if (urlId) {
    const result = await handleFetch(urlId);
    if (result?.error && result.error.errorCode) {
      res.status(result.error.errorCode ?? 404).json({ error: result.error?.message });
    } else if (result?.result) {
      res.status(200).json({ result: result.result })
      return;
    }
  }
  
  res.status(404).send({ error: "This URL is invalid or a destination URL could not be found" })
}

export default handler;