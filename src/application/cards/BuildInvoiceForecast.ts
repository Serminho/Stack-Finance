import type { CardPurchase } from '../../domain/cards/CardPurchase'
import type { CreditCard } from '../../domain/cards/CreditCard'
import { Money } from '../../domain/money/Money'

export type ScheduledInstallment = {
  purchaseId: string
  description: string
  categoryId: string
  number: number
  count: number
  amount: Money
}

export type InvoiceForecast = {
  id: string
  cardId: string
  cardName: string
  closingDate: string
  dueDate: string
  total: Money
  installments: ScheduledInstallment[]
}

function addMonths(year: number, monthIndex: number, amount: number): { year: number; monthIndex: number } {
  const date = new Date(Date.UTC(year, monthIndex + amount, 1))
  return { year: date.getUTCFullYear(), monthIndex: date.getUTCMonth() }
}

function isoDate(year: number, monthIndex: number, day: number): string {
  const lastDay = new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate()
  const safeDay = Math.min(day, lastDay)
  return `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(safeDay).padStart(2, '0')}`
}

function monthFromDate(date: string): { year: number; monthIndex: number; day: number } {
  const [year, month, day] = date.split('-').map(Number)
  return { year, monthIndex: month - 1, day }
}

export function buildInvoiceForecast(cards: CreditCard[], purchases: CardPurchase[]): InvoiceForecast[] {
  const cardsById = new Map(cards.map((card) => [card.id, card]))
  const invoices = new Map<string, InvoiceForecast>()

  for (const purchase of purchases) {
    const card = cardsById.get(purchase.cardId)
    if (!card) continue

    const purchaseDate = monthFromDate(purchase.date)
    const firstCycle = addMonths(purchaseDate.year, purchaseDate.monthIndex, purchaseDate.day <= card.closingDay ? 0 : 1)
    const baseCents = Math.floor(purchase.amount.cents / purchase.installments)
    const extraCents = purchase.amount.cents % purchase.installments

    for (let index = 0; index < purchase.installments; index += 1) {
      const cycle = addMonths(firstCycle.year, firstCycle.monthIndex, index)
      const closingDate = isoDate(cycle.year, cycle.monthIndex, card.closingDay)
      const dueCycle = card.dueDay > card.closingDay ? cycle : addMonths(cycle.year, cycle.monthIndex, 1)
      const dueDate = isoDate(dueCycle.year, dueCycle.monthIndex, card.dueDay)
      const id = `${card.id}:${closingDate}`
      const installment: ScheduledInstallment = {
        purchaseId: purchase.id,
        description: purchase.description,
        categoryId: purchase.categoryId,
        number: index + 1,
        count: purchase.installments,
        amount: Money.fromCents(baseCents + (index < extraCents ? 1 : 0)),
      }
      const invoice = invoices.get(id) ?? {
        id,
        cardId: card.id,
        cardName: card.name,
        closingDate,
        dueDate,
        total: Money.zero(),
        installments: [],
      }
      invoice.installments.push(installment)
      invoice.total = invoice.total.plus(installment.amount)
      invoices.set(id, invoice)
    }
  }

  return [...invoices.values()].sort((a, b) => a.dueDate.localeCompare(b.dueDate) || a.cardName.localeCompare(b.cardName))
}
