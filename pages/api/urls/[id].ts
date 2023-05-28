// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'

type Data = {
  originalUrl?: string;
  error?: string;
}

const handleFetch = async (urlId: string) => {
  const res = await fetch(`http://127.0.0.1:8080/urls/${urlId}`);
  const data = await res.json();
  return data;
}

export const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<Data>
) => {
  const urlId = req.query["id"] as string | undefined;

  if (urlId) {
    const originalUrl = await handleFetch(urlId);
    res.status(200).json({ originalUrl });
  }
  
  res.status(404).send({ error: "This URL is invalid or does not contain an existing redirect URL" })
}

export default handler;