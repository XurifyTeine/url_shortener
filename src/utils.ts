export const getIdFromPathname = (pathname: string): string | null => {
  if (pathname && pathname.slice(0, 5) === "/urls") {
    const numberOfSlashes = pathname.split("/").filter((item) => item).length;
    if (numberOfSlashes !== 1) return null;
    const id = pathname.split("/")[1];
    return id;
  }
  return null;
};
