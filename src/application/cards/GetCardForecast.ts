import type { CardPurchaseRepository } from '../../domain/cards/CardPurchaseRepository'
import type { CreditCardRepository } from '../../domain/cards/CreditCardRepository'
import type { PersonRepository } from '../../domain/people/PersonRepository'
import { buildInvoiceForecast, type InvoiceForecast } from './BuildInvoiceForecast'

export type CardForecastView = {
  cards: Awaited<ReturnType<CreditCardRepository['getAllCards']>>
  people: Awaited<ReturnType<PersonRepository['getAllPeople']>>
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
    private readonly people: PersonRepository,
  ) {}

  async execute(): Promise<CardForecastView> {
    const [cards, purchases, people] = await Promise.all([
      this.cards.getAllCards(),
      this.purchases.getAllCardPurchases(),
      this.people.getAllPeople(),
    ])
    return {
      cards,
      people,
      invoices: buildInvoiceForecast(cards, purchases, people).filter((invoice) => invoice.dueDate.slice(0, 7) >= currentMonth()),
    }
  }
}
