export interface TransactionResponse {
  totalInserted: number;
  totalUpdated: number;
  totalReplaced: number;
  totalDeleted: number;
  insertedIds: string[];
}
