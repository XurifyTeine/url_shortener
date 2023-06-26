export interface URLData {
  destination: string;
  id: string;
  date_created: string;
  url: string;
  self_destruct: number;
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

export type URLDataNextAPI = {
  result?: URLData;
  message?: string;
  error?: string;
};