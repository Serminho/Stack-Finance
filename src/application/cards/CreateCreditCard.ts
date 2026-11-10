import { CreditCard } from '../../domain/cards/CreditCard'
import type { CreditCardRepository } from '../../domain/cards/CreditCardRepository'

export type CreateCreditCardInput = { name: string; closingDay: number; dueDay: number }

export class CreateCreditCard {
  constructor(private readonly cards: CreditCardRepository) {}

  async execute(input: CreateCreditCardInput): Promise<CreditCard> {
    const card = CreditCard.create(input.name, input.closingDay, input.dueDay)
    await this.cards.saveCard(card)
    return card
  }
}
