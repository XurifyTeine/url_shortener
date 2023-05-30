import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { URLDataResponse } from "./src/interfaces";
import { BASE_URL } from "./src/constants";
import { getIdFromPathname } from "./src/utils";

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const routesToExclude = ["/favicon.ico", "/", "/api"];
  if (
    request.nextUrl.pathname.match("_next/|((?<!.)([^.])+/api)") ||
    routesToExclude.includes(request.nextUrl.pathname)
  ) {
    return NextResponse.next();
  }

  const shortId = getIdFromPathname(request.nextUrl.pathname);

  if (!shortId) {
    return NextResponse.next();
  }

  const url = `${BASE_URL}/urls/${shortId}`;

  const response = await fetch(url);
  const result: URLDataResponse = await response.json();
  const data: URLDataResponse | null = result || null;

  if (data.error) {
    const error = {
      data,
      error: data.error,
      url,
    };
    console.error("MIDDLEWARE ERROR:", error);
  }

  if (data && data.result && data.result.destination) {
    return NextResponse.redirect(new URL(data.result.destination));
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/:id*",
};
