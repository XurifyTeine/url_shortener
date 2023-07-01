export interface URLData {
  destination: string;
  id: string;
  date_created: string;
  url: string;
  self_destruct: string;
  session_token?: string | null;
  password?: { String: string; Valid: boolean } | null;
}

export interface URLError {
  error: string;
  message: string;
  errorCode: number;
}

export type URLDataResponse =
  | {
      result: URLData;
      error?: URLError;
    }
  | {
      result?: URLData;
      error: URLError;
    };

export type URLDataNextAPI = {
  result?: URLData;
  message?: string;
  error?: string;
};
