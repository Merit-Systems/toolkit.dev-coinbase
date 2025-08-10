export type TransactionsResponse<T> = {
  transactions: T[];
  next_page_key: string;
  total_count: string;
};
