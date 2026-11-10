import { describe, expect, it } from 'vitest'
import { CreateCardPurchase } from '../../src/application/cards/CreateCardPurchase'
import type { CardPurchaseRepository } from '../../src/domain/cards/CardPurchaseRepository'
import type { CreditCardRepository } from '../../src/domain/cards/CreditCardRepository'
import { CardPurchase } from '../../src/domain/cards/CardPurchase'
import { CreditCard } from '../../src/domain/cards/CreditCard'

class InMemoryCards implements CreditCardRepository {
  constructor(private readonly card?: CreditCard) {}
  async getAllCards() { return this.card ? [this.card] : [] }
  async getCardById(id: string) { return this.card?.id === id ? this.card : undefined }
  async saveCard() {}
}

class InMemoryPurchases implements CardPurchaseRepository {
  saved: CardPurchase[] = []
  async getAllCardPurchases() { return this.saved }
  async saveCardPurchase(purchase: CardPurchase) { this.saved.push(purchase) }
}

const purchaseInput = (cardId: string) => ({
  cardId,
  description: 'Notebook',
  amount: '3000,00',
  installments: 5,
  categoryId: 'home',
  date: '2026-11-10',
})

describe('CreateCardPurchase', () => {
  it('salva compra parcelada com os dados informados', async () => {
    const card = CreditCard.create('Cartão principal', 20, 5)
    const purchases = new InMemoryPurchases()
    const useCase = new CreateCardPurchase(new InMemoryCards(card), purchases)

    const result = await useCase.execute(purchaseInput(card.id))

    expect(result.installments).toBe(5)
    expect(result.amount.cents).toBe(300000)
    expect(purchases.saved).toEqual([result])
  })

  it('rejeita cartão inexistente sem salvar a compra', async () => {
    const purchases = new InMemoryPurchases()
    const useCase = new CreateCardPurchase(new InMemoryCards(), purchases)

    await expect(useCase.execute(purchaseInput('missing'))).rejects.toThrow('cartão selecionado')
    expect(purchases.saved).toHaveLength(0)
  })

  it('rejeita categoria de receita em compra de cartão', async () => {
    const card = CreditCard.create('Cartão principal', 20, 5)
    const purchases = new InMemoryPurchases()
    const useCase = new CreateCardPurchase(new InMemoryCards(card), purchases)

    await expect(useCase.execute({ ...purchaseInput(card.id), categoryId: 'salary' })).rejects.toThrow('categoria de despesa')
    expect(purchases.saved).toHaveLength(0)
  })

  it('rejeita um número de parcelas fora do intervalo permitido', async () => {
    const card = CreditCard.create('Cartão principal', 20, 5)
    const purchases = new InMemoryPurchases()
    const useCase = new CreateCardPurchase(new InMemoryCards(card), purchases)

    await expect(useCase.execute({ ...purchaseInput(card.id), installments: 37 })).rejects.toThrow('1 a 36 parcelas')
    expect(purchases.saved).toHaveLength(0)
  })
})
