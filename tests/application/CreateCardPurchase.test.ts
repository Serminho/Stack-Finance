import { describe, expect, it } from 'vitest'
import { CreateCardPurchase } from '../../src/application/cards/CreateCardPurchase'
import type { CardPurchaseRepository } from '../../src/domain/cards/CardPurchaseRepository'
import type { CreditCardRepository } from '../../src/domain/cards/CreditCardRepository'
import type { PersonRepository } from '../../src/domain/people/PersonRepository'
import { CardPurchase } from '../../src/domain/cards/CardPurchase'
import { CreditCard } from '../../src/domain/cards/CreditCard'
import { Person } from '../../src/domain/people/Person'

class InMemoryCards implements CreditCardRepository {
  constructor(private readonly card?: CreditCard) {}
  async getAllCards() { return this.card ? [this.card] : [] }
  async getCardById(id: string) { return this.card?.id === id ? this.card : undefined }
  async saveCard() {}
}
class InMemoryPeople implements PersonRepository {
  constructor(private readonly people: Person[]) {}
  async getAllPeople() { return this.people }
  async getPersonById(id: string) { return this.people.find((person) => person.id === id) }
  async savePerson(person: Person) { this.people.push(person) }
}
class InMemoryPurchases implements CardPurchaseRepository {
  saved: CardPurchase[] = []
  async getAllCardPurchases() { return this.saved }
  async saveCardPurchase(purchase: CardPurchase) { this.saved.push(purchase) }
}

describe('CreateCardPurchase', () => {
  it('salva compra parcelada com partes validadas', async () => {
    const card = CreditCard.create('Cartão principal', 20, 5)
    const person = Person.create('Sam')
    const purchases = new InMemoryPurchases()
    const useCase = new CreateCardPurchase(new InMemoryCards(card), purchases, new InMemoryPeople([person]))
    const result = await useCase.execute({ cardId: card.id, description: 'Notebook', amount: '3000,00', installments: 5, categoryId: 'home', date: '2026-11-10', allocations: [{ personId: person.id, amount: '3000,00' }] })
    expect(result.installments).toBe(5)
    expect(result.allocations[0].amount.cents).toBe(300000)
    expect(purchases.saved).toEqual([result])
  })

  it('rejeita parte que não fecha o total', async () => {
    const card = CreditCard.create('Cartão principal', 20, 5)
    const person = Person.create('Sam')
    const purchases = new InMemoryPurchases()
    const useCase = new CreateCardPurchase(new InMemoryCards(card), purchases, new InMemoryPeople([person]))
    await expect(useCase.execute({ cardId: card.id, description: 'Notebook', amount: '3000,00', installments: 1, categoryId: 'home', date: '2026-11-10', allocations: [{ personId: person.id, amount: '2999,99' }] })).rejects.toThrow('somar exatamente')
    expect(purchases.saved).toHaveLength(0)
  })

  it('rejeita pessoa não cadastrada', async () => {
    const card = CreditCard.create('Cartão principal', 20, 5)
    const purchases = new InMemoryPurchases()
    const useCase = new CreateCardPurchase(new InMemoryCards(card), purchases, new InMemoryPeople([]))
    await expect(useCase.execute({ cardId: card.id, description: 'Notebook', amount: '3000,00', installments: 1, categoryId: 'home', date: '2026-11-10', allocations: [{ personId: 'missing', amount: '3000,00' }] })).rejects.toThrow('pessoas selecionadas')
  })
})
