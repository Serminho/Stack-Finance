import type { AccountRepository } from '../../domain/accounts/AccountRepository'
import { Money } from '../../domain/money/Money'
import { FinancialTransaction, type TransactionType } from '../../domain/transactions/FinancialTransaction'
import { categoryById } from '../../domain/transactions/TransactionCategory'
import type { TransactionRepository } from '../../domain/transactions/TransactionRepository'

export type UpdateTransactionInput = {
  id: string
  accountId: string
  type: TransactionType
  amount: string
  categoryId: string
  description: string
  date: string
}

export class UpdateTransaction {
  constructor(
    private readonly accounts: AccountRepository,
    private readonly transactions: TransactionRepository,
  ) {}

  async execute(input: UpdateTransactionInput): Promise<FinancialTransaction> {
    const existing = await this.transactions.getTransactionById(input.id)
    if (!existing) throw new Error('A movimentação não foi encontrada.')

    const account = await this.accounts.getAccountById(input.accountId)
    if (!account) throw new Error('A conta selecionada não foi encontrada.')

    const category = categoryById(input.categoryId)
    if (!category || category.type !== input.type) {
      throw new Error('Selecione uma categoria válida para esse tipo de movimentação.')
    }

    const updated = FinancialTransaction.revise(existing, {
      accountId: account.id,
      type: input.type,
      amount: Money.fromInput(input.amount),
      categoryId: category.id,
      description: input.description,
      date: input.date,
    })
    await this.transactions.saveTransaction(updated)
    return updated
  }
}
