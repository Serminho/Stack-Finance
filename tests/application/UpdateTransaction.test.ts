import { beforeEach, describe, expect, it } from 'vitest'
import { Account } from '../../src/domain/accounts/Account'
import type { AccountRepository } from '../../src/domain/accounts/AccountRepository'
import { Money } from '../../src/domain/money/Money'
import { FinancialTransaction } from '../../src/domain/transactions/FinancialTransaction'
import type { TransactionRepository } from '../../src/domain/transactions/TransactionRepository'
import { UpdateTransaction } from '../../src/application/transactions/UpdateTransaction'

class InMemoryAccounts implements AccountRepository {
  constructor(private readonly account: Account) {}
  async getAllAccounts() { return [this.account] }
  async getAccountById(id: string) { return id === this.account.id ? this.account : undefined }
  async saveAccount() {}
}

class InMemoryTransactions implements TransactionRepository {
  saved: FinancialTransaction[] = []
  constructor(private transaction?: FinancialTransaction) {}
  async getAllTransactions() { return this.transaction ? [this.transaction, ...this.saved] : this.saved }
  async getTransactionById(id: string) { return this.transaction?.id === id ? this.transaction : undefined }
  async saveTransaction(transaction: FinancialTransaction) { this.saved.push(transaction); this.transaction = transaction }
  async deleteTransactionById(id: string) { if (this.transaction?.id === id) this.transaction = undefined }
}

describe('UpdateTransaction', () => {
  let account: Account
  let original: FinancialTransaction
  let transactions: InMemoryTransactions
  let updateTransaction: UpdateTransaction

  beforeEach(() => {
    account = Account.create('Conta principal', Money.fromCents(50000))
    original = FinancialTransaction.create({
      accountId: account.id,
      type: 'expense',
      amount: Money.fromCents(2500),
      categoryId: 'food',
      description: 'Almoço',
      date: '2026-11-10',
    })
    transactions = new InMemoryTransactions(original)
    updateTransaction = new UpdateTransaction(new InMemoryAccounts(account), transactions)
  })

  it('atualiza os dados e preserva o id e a data de criação', async () => {
    const updated = await updateTransaction.execute({
      id: original.id,
      accountId: account.id,
      type: 'expense',
      amount: '42,75',
      categoryId: 'food',
      description: 'Mercado',
      date: '2026-11-09',
    })

    expect(updated.id).toBe(original.id)
    expect(updated.createdAt).toBe(original.createdAt)
    expect(updated.amount.cents).toBe(4275)
    expect(updated.description).toBe('Mercado')
    expect(transactions.saved).toContain(updated)
  })

  it('rejeita categoria incompatível com o tipo', async () => {
    await expect(updateTransaction.execute({
      id: original.id,
      accountId: account.id,
      type: 'income',
      amount: '42,75',
      categoryId: 'food',
      description: 'Salário',
      date: '2026-11-09',
    })).rejects.toThrow('categoria válida')
    expect(transactions.saved).toHaveLength(0)
  })

  it('não altera uma movimentação inexistente', async () => {
    await expect(updateTransaction.execute({
      id: 'missing',
      accountId: account.id,
      type: 'expense',
      amount: '42,75',
      categoryId: 'food',
      description: 'Mercado',
      date: '2026-11-09',
    })).rejects.toThrow('não foi encontrada')
  })
})
