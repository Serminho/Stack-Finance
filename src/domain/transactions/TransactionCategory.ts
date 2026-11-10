import type { TransactionType } from './FinancialTransaction'

export type TransactionCategory = {
  id: string
  label: string
  type: TransactionType
}

export const TRANSACTION_CATEGORIES: TransactionCategory[] = [
  { id: 'salary', label: 'Salário', type: 'income' },
  { id: 'freelance', label: 'Trabalho extra', type: 'income' },
  { id: 'other-income', label: 'Outra receita', type: 'income' },
  { id: 'home', label: 'Casa', type: 'expense' },
  { id: 'food', label: 'Alimentação', type: 'expense' },
  { id: 'transport', label: 'Transporte', type: 'expense' },
  { id: 'health', label: 'Saúde', type: 'expense' },
  { id: 'leisure', label: 'Lazer', type: 'expense' },
  { id: 'other-expense', label: 'Outra despesa', type: 'expense' },
]

export function categoriesFor(type: TransactionType): TransactionCategory[] {
  return TRANSACTION_CATEGORIES.filter((category) => category.type === type)
}

export function categoryById(id: string): TransactionCategory | undefined {
  return TRANSACTION_CATEGORIES.find((category) => category.id === id)
}
