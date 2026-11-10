import { describe, expect, it } from 'vitest'
import { CardPurchase } from '../../src/domain/cards/CardPurchase'
import { Money } from '../../src/domain/money/Money'

describe('CardPurchase allocations', () => {
  const base = {
    cardId: 'card-1', description: 'Compra', amount: Money.fromCents(10001),
    installments: 3, categoryId: 'food', date: '2026-11-10',
  }

  it('requires participant shares to match the purchase total', () => {
    expect(() => CardPurchase.create({ ...base, allocations: [
      { personId: 'person-1', amount: Money.fromCents(5000) },
      { personId: 'person-2', amount: Money.fromCents(5000) },
    ] })).toThrow('somar exatamente')
  })

  it('rejects duplicate people and zero-value shares', () => {
    expect(() => CardPurchase.create({ ...base, allocations: [
      { personId: 'person-1', amount: Money.fromCents(5000) },
      { personId: 'person-1', amount: Money.fromCents(5001) },
    ] })).toThrow('uma vez')
    expect(() => CardPurchase.create({ ...base, allocations: [
      { personId: 'person-1', amount: Money.zero() },
      { personId: 'person-2', amount: Money.fromCents(10001) },
    ] })).toThrow('maior que zero')
  })

  it('restores older purchases without division and preserves their data', () => {
    const restored = CardPurchase.restore({
      id: 'legacy', cardId: 'card-1', description: 'Compra antiga', amount: Money.fromCents(1000),
      installments: 1, categoryId: 'food', date: '2026-11-10', createdAt: '2026-11-10T12:00:00.000Z',
    })
    expect(restored.allocations).toEqual([])
  })
})
