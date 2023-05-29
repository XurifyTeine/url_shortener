export const getIdFromPathname = (pathname: string): string | null => {
  if (pathname && pathname[0] === "/") {
    const id = pathname.split("/")[1];
    return id;
  }
  return null;
};
