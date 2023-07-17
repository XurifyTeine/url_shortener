export interface URLData {
  id: string;
  date_created: string;
  destination: string;
  max_page_hits: number;
  page_hits: number;
  password?: string | null;
  self_destruct: string | null;
  session_token?: string | null;
  url: string;
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
