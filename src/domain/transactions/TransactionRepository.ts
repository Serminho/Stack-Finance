import type { FinancialTransaction } from './FinancialTransaction'

export interface TransactionRepository {
  getAllTransactions(): Promise<FinancialTransaction[]>
  saveTransaction(transaction: FinancialTransaction): Promise<void>
  deleteTransactionById(id: string): Promise<void>
}
