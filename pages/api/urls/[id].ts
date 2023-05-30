// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { BASE_URL } from '@/src/constants';
import { URLData, URLDataResponse } from '@/src/interfaces';
import type { NextApiRequest, NextApiResponse } from 'next'
import { Data } from '../create-short-url';

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
  res: NextApiResponse<Data>
) => {
  const urlId = req.query["id"] as string | undefined;

  if (urlId) {
    const urlData = await handleFetch(urlId);
    if (urlData?.result) {
      res.status(200).json({ result: urlData.result });
    }
  }
  
  res.status(404).send({ error: "This URL is invalid or a destination URL could not be found" })
}

export default handler;