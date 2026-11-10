import type { FinancialTransaction } from './FinancialTransaction'

export interface TransactionRepository {
  getAllTransactions(): Promise<FinancialTransaction[]>
  getTransactionById(id: string): Promise<FinancialTransaction | undefined>
  saveTransaction(transaction: FinancialTransaction): Promise<void>
  deleteTransactionById(id: string): Promise<void>
}
