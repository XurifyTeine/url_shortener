import { NextRequest, NextResponse } from "next/server";
import { BASE_URL } from "./src/constants";

export const middleware = async (req: NextRequest) => {
  const res = NextResponse.next();

  const currentSessionToken = req.headers.get("cookie");
  const splitCurrentSessionToken =
    currentSessionToken && currentSessionToken?.split("=");

  if (splitCurrentSessionToken) {
    const key: string = splitCurrentSessionToken[0];
    const value: string = splitCurrentSessionToken[1];
    res.cookies.set(key, value);
  } else {
    const url = `${BASE_URL}/set-cookie`;
    const cookieRequest = await fetch(url);
    const cookieResponse = await cookieRequest.json();
    if (cookieResponse?.result) {
      const key: string = cookieResponse?.result?.key;
      const value: string = cookieResponse?.result?.value;
      res.cookies.set(key, value);
    }
  }

  return res;
};
