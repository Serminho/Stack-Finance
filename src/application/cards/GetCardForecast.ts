import type { CardPurchaseRepository } from '../../domain/cards/CardPurchaseRepository'
import type { CreditCardRepository } from '../../domain/cards/CreditCardRepository'
import { buildInvoiceForecast, type InvoiceForecast } from './BuildInvoiceForecast'

export type CardForecastView = {
  cards: Awaited<ReturnType<CreditCardRepository['getAllCards']>>
  invoices: InvoiceForecast[]
}

function currentMonth(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

export class GetCardForecast {
  constructor(
    private readonly cards: CreditCardRepository,
    private readonly purchases: CardPurchaseRepository,
  ) {}

  async execute(): Promise<CardForecastView> {
    const [cards, purchases] = await Promise.all([
      this.cards.getAllCards(),
      this.purchases.getAllCardPurchases(),
    ])
    return {
      cards,
      invoices: buildInvoiceForecast(cards, purchases).filter((invoice) => invoice.dueDate.slice(0, 7) >= currentMonth()),
    }
  }
}
