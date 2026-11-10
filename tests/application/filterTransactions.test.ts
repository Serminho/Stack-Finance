import { describe, expect, it } from 'vitest'
import { Money } from '../../src/domain/money/Money'
import { FinancialTransaction } from '../../src/domain/transactions/FinancialTransaction'
import { filterTransactions } from '../../src/application/transactions/filterTransactions'

function createTransaction(accountId: string, categoryId: string, description: string) {
  return FinancialTransaction.create({
    accountId,
    type: 'expense',
    amount: Money.fromCents(1200),
    categoryId,
    description,
    date: '2026-11-10',
  })
}

const transactions = [
  createTransaction('checking', 'food', 'Mercado'),
  createTransaction('wallet', 'transport', 'Ônibus'),
  createTransaction('checking', 'transport', 'Combustível'),
]

describe('filterTransactions', () => {
  it('retorna todos quando nenhum filtro está selecionado', () => {
    expect(filterTransactions(transactions, {})).toEqual(transactions)
  })

  it('filtra pela conta selecionada', () => {
    expect(filterTransactions(transactions, { accountId: 'checking' }).map((item) => item.description))
      .toEqual(['Mercado', 'Combustível'])
  })

  it('filtra pela categoria selecionada', () => {
    expect(filterTransactions(transactions, { categoryId: 'transport' }).map((item) => item.description))
      .toEqual(['Ônibus', 'Combustível'])
  })

  it('combina conta e categoria', () => {
    expect(filterTransactions(transactions, { accountId: 'checking', categoryId: 'transport' }).map((item) => item.description))
      .toEqual(['Combustível'])
  })

  it('retorna lista vazia quando não há correspondência', () => {
    expect(filterTransactions(transactions, { accountId: 'wallet', categoryId: 'food' })).toEqual([])
  })
})
