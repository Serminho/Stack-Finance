import type { AccountRepository } from '../../domain/accounts/AccountRepository'
import { Money } from '../../domain/money/Money'
import { FinancialTransaction, type TransactionType } from '../../domain/transactions/FinancialTransaction'
import { categoryById } from '../../domain/transactions/TransactionCategory'
import type { TransactionRepository } from '../../domain/transactions/TransactionRepository'

export type CreateTransactionInput = {
  accountId: string
  type: TransactionType
  amount: string
  categoryId: string
  description: string
  date: string
}

export class CreateTransaction {
  constructor(
    private readonly accounts: AccountRepository,
    private readonly transactions: TransactionRepository,
  ) {}

  async execute(input: CreateTransactionInput): Promise<FinancialTransaction> {
    const account = await this.accounts.getAccountById(input.accountId)
    if (!account) throw new Error('A conta selecionada não foi encontrada.')

    const category = categoryById(input.categoryId)
    if (!category || category.type !== input.type) {
      throw new Error('Selecione uma categoria válida para esse tipo de movimentação.')
    }

    const transaction = FinancialTransaction.create({
      accountId: account.id,
      type: input.type,
      amount: Money.fromInput(input.amount),
      categoryId: category.id,
      description: input.description,
      date: input.date,
    })
    await this.transactions.saveTransaction(transaction)
    return transaction
  }
}

