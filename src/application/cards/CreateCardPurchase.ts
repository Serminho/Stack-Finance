import type { CardPurchaseRepository } from '../../domain/cards/CardPurchaseRepository'
import type { CreditCardRepository } from '../../domain/cards/CreditCardRepository'
import type { PersonRepository } from '../../domain/people/PersonRepository'
import { CardPurchase } from '../../domain/cards/CardPurchase'
import { Money } from '../../domain/money/Money'
import { categoryById } from '../../domain/transactions/TransactionCategory'

export type CreateCardPurchaseInput = {
  cardId: string
  description: string
  amount: string
  installments: number
  categoryId: string
  date: string
  allocations: { personId: string; amount: string }[]
}

export class CreateCardPurchase {
  constructor(
    private readonly cards: CreditCardRepository,
    private readonly purchases: CardPurchaseRepository,
    private readonly people: PersonRepository,
  ) {}

  async execute(input: CreateCardPurchaseInput): Promise<CardPurchase> {
    const card = await this.cards.getCardById(input.cardId)
    if (!card) throw new Error('O cartão selecionado não foi encontrado.')
    const category = categoryById(input.categoryId)
    if (!category || category.type !== 'expense') throw new Error('Selecione uma categoria de despesa válida.')
    const registeredPeople = await this.people.getAllPeople()
    const registeredIds = new Set(registeredPeople.map((person) => person.id))
    const allocations = input.allocations.map((allocation) => {
      if (!registeredIds.has(allocation.personId)) throw new Error('Uma das pessoas selecionadas não foi encontrada.')
      return { personId: allocation.personId, amount: Money.fromInput(allocation.amount) }
    })
    const purchase = CardPurchase.create({
      cardId: card.id,
      description: input.description,
      amount: Money.fromInput(input.amount),
      allocations,
      installments: input.installments,
      categoryId: category.id,
      date: input.date,
    })
    await this.purchases.saveCardPurchase(purchase)
    return purchase
  }
}




