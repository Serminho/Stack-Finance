import { describe, expect, it } from 'vitest'
import { buildInvoiceForecast } from '../../src/application/cards/BuildInvoiceForecast'
import { CardPurchase } from '../../src/domain/cards/CardPurchase'
import { CreditCard } from '../../src/domain/cards/CreditCard'
import { Money } from '../../src/domain/money/Money'

function card(closingDay: number, dueDay: number) {
  return CreditCard.create('Cartão principal', closingDay, dueDay)
}

function purchase(cardId: string, date: string, amountCents: number, installments: number) {
  return CardPurchase.create({
    cardId,
    description: 'Compra de teste',
    amount: Money.fromCents(amountCents),
    installments,
    categoryId: 'food',
    date,
  })
}

describe('buildInvoiceForecast', () => {
  it('inclui compras feitas no dia do fechamento no ciclo atual', () => {
    const creditCard = card(20, 5)
    const [invoice] = buildInvoiceForecast([creditCard], [purchase(creditCard.id, '2026-11-20', 10000, 1)])

    expect(invoice.closingDate).toBe('2026-11-20')
    expect(invoice.dueDate).toBe('2026-12-05')
    expect(invoice.total.cents).toBe(10000)
  })

  it('leva compras após o fechamento para o ciclo seguinte', () => {
    const creditCard = card(20, 5)
    const [invoice] = buildInvoiceForecast([creditCard], [purchase(creditCard.id, '2026-11-21', 10000, 1)])

    expect(invoice.closingDate).toBe('2026-12-20')
    expect(invoice.dueDate).toBe('2027-01-05')
  })

  it('distribui os centavos restantes e agrupa parcelas em meses futuros', () => {
    const creditCard = card(20, 5)
    const invoices = buildInvoiceForecast([creditCard], [purchase(creditCard.id, '2026-11-10', 10000, 3)])

    expect(invoices.map((invoice) => invoice.total.cents)).toEqual([3334, 3333, 3333])
    expect(invoices.map((invoice) => invoice.dueDate)).toEqual(['2026-12-05', '2027-01-05', '2027-02-05'])
    expect(invoices.reduce((total, invoice) => total + invoice.total.cents, 0)).toBe(10000)
  })

  it('usa o mesmo mês quando o vencimento ocorre depois do fechamento', () => {
    const creditCard = card(5, 20)
    const [invoice] = buildInvoiceForecast([creditCard], [purchase(creditCard.id, '2026-11-03', 5000, 1)])
    expect(invoice.dueDate).toBe('2026-11-20')
  })

  it('limita o fechamento ao último dia em meses curtos', () => {
    const creditCard = card(31, 5)
    const [invoice] = buildInvoiceForecast([creditCard], [purchase(creditCard.id, '2026-02-27', 5000, 1)])
    expect(invoice.closingDate).toBe('2026-02-28')
  })
})
