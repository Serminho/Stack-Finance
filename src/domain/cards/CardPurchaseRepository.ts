import type { CardPurchase } from './CardPurchase'

export interface CardPurchaseRepository {
  getAllCardPurchases(): Promise<CardPurchase[]>
  saveCardPurchase(purchase: CardPurchase): Promise<void>
}

