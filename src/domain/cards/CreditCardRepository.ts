import type { CreditCard } from './CreditCard'

export interface CreditCardRepository {
  getAllCards(): Promise<CreditCard[]>
  getCardById(id: string): Promise<CreditCard | undefined>
  saveCard(card: CreditCard): Promise<void>
}
