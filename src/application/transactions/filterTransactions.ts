import type { FinancialTransaction } from '../../domain/transactions/FinancialTransaction'

export type TransactionFilters = {
  accountId?: string
  categoryId?: string
}

export function filterTransactions(
  transactions: FinancialTransaction[],
  filters: TransactionFilters,
): FinancialTransaction[] {
  return transactions.filter((transaction) => {
    const matchesAccount = !filters.accountId || transaction.accountId === filters.accountId
    const matchesCategory = !filters.categoryId || transaction.categoryId === filters.categoryId
    return matchesAccount && matchesCategory
  })
}
