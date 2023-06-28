export const PRODUCTION_SITE_URL = "https://nolongr.vercel.app/api"
export const BASE_URL = process.env.NODE_ENV === "production" ? PRODUCTION_SITE_URL : "http://localhost:3000/api"
export const URL_REGEX = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()!@:%_\+.~#?&\/\/=]*)/
export const SIXTY_SECONDS = 60000;
export const selfDestructDurations = [
    {
        label: "Self-destruct",
        value: "",
    },
    {
      label: "1 minute",
      value: SIXTY_SECONDS * 1,
    },
    {
      label: "3 minutes",
      value: SIXTY_SECONDS * 3,
    },
    {
      label: "5 minutes",
      value: SIXTY_SECONDS * 5,
    },
    {
      label: "10 minutes",
      value: SIXTY_SECONDS * 10,
    },
    {
      label: "30 minutes",
      value: SIXTY_SECONDS * 30,
    },
    {
      label: "1 hour",
      value: SIXTY_SECONDS * 60,
    },
    {
      label: "2 hours",
      value: SIXTY_SECONDS * 120,
    },
    {
      label: "5 hours",
      value: SIXTY_SECONDS * 300,
    },
    {
      label: "10 hours",
      value: SIXTY_SECONDS * 600,
    },
    {
      label: "1 day",
      value: SIXTY_SECONDS * 1440,
    },
    {
      label: "1 week",
      value: SIXTY_SECONDS * 10080,
    },
    {
      label: "1 month",
      value: SIXTY_SECONDS * 43800,
    },
    {
      label: "1 year",
      value: SIXTY_SECONDS * 525960,
    },
  ];