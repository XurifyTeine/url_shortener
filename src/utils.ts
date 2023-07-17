export const getIdFromPathname = (pathname: string): string | null => {
  if (pathname && pathname.slice(0, 5) === "/urls") {
    const numberOfSlashes = pathname.split("/").filter((item) => item).length;
    if (numberOfSlashes !== 2) return null;
    const id = pathname.split("/")[2];
    return id;
  }
  return null;
};

export const isClientSide = () => typeof window !== "undefined";
export const isServerSide = () => typeof window === "undefined";

export const truncateText = (text: string, length: number) => {
  if (text.length <= length) {
    return text;
  }
  return `${text.slice(0, length)}...`;
};

export const encodeObjectToQueryParams = (obj: Record<string, any>): string => {
  const queryParams = Object.entries(obj)
    .filter(([_key, value]) => value !== undefined)
    .map(([key, value]) => {
      return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
    })
    .join("&");
  return queryParams;
};
