import { GetServerSideProps } from "next/types";
import { BASE_URL } from "@/src/constants";
import { URLDataResponse } from "@/src/interfaces";

export default function RedirectPage() {
  return null;
}

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const shortId = query["id"];

  try {
    const url = `${BASE_URL}/urls/${shortId}`;

    const response = await fetch(url);
    const result: URLDataResponse = await response.json();
    const data: URLDataResponse | null = result || null;

    if (!data) {
      return { notFound: true };
    } else if (data && data.error) {
      const error = {
        data,
        error: data.error,
        url,
      };
      console.error(`SERVERSIDE [ID] PAGE ERROR: ${shortId}`, error);
      return { notFound: true };
    } else if (data && data.result && data.result.destination)
      return {
        redirect: {
          destination: data.result.destination,
          permanent: false,
        },
      };
  } catch (err) {
    return { notFound: true };
  }
  return { props: {} };
};
