export interface URLData {
  destination: string;
  id: string;
  date_created: string;
  url: string;
}

export interface URLError {
  error: string;
  message: string;
  errorCode: number;
}

export type URLDataResponse = {
  result: URLData;
  error?: URLError;
} | {
  result?: URLData;
  error: URLError;
}
