// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { BASE_URL } from '@/src/constants';
import { URLData } from '@/src/interfaces';
import type { NextApiRequest, NextApiResponse } from 'next'

type Data = {
  data?: URLData;
  error?: string;
}

const handleFetch = async (urlId: string) => {
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
    res.status(200).json({ data: urlData });
  }
  
  res.status(404).send({ error: "This URL is invalid or a destination URL could not be found" })
}

export default handler;