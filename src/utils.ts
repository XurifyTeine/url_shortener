export const getIdFromPathname = (pathname: string): string | null => {
  if (pathname && pathname[0] === "/") {
    const numberOfSlashes = pathname.split("/").length;
    if (numberOfSlashes !== 1) return null;
    const id = pathname.split("/")[1];
    return id;
  }
  return null;
};
