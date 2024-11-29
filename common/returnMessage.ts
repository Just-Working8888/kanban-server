export interface successMessage {
  message: string;
  data?: Object | undefined | null;
}

export interface errorMessage {
  message: string;
  status?: number;
}
