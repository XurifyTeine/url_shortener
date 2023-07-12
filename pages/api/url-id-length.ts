import type { NextApiRequest, NextApiResponse } from "next";
import { get } from "@vercel/edge-config";

export default async function handler(
  _request: NextApiRequest,
  res: NextApiResponse
) {
  const urlIdLength = await get("url_id_length");
  return res.status(200).send({ result: urlIdLength });
}
