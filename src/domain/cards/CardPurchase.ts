import { Money } from '../money/Money'

export type CardPurchaseProps = {
  id: string
  cardId: string
  description: string
  amount: Money
  installments: number
  categoryId: string
  date: string
  createdAt: string
}

export class CardPurchase {
  readonly id: string
  readonly cardId: string
  readonly description: string
  readonly amount: Money
  readonly installments: number
  readonly categoryId: string
  readonly date: string
  readonly createdAt: string

  private constructor(props: CardPurchaseProps) {
    const description = props.description.trim()
    if (!description) throw new Error('Informe uma descrição para a compra.')
    if (props.amount.cents <= 0) throw new Error('O valor da compra precisa ser maior que zero.')
    if (!Number.isInteger(props.installments) || props.installments < 1 || props.installments > 36) {
      throw new Error('Escolha de 1 a 36 parcelas.')
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(props.date) || Number.isNaN(Date.parse(`${props.date}T12:00:00`))) {
      throw new Error('Informe uma data válida para a compra.')
    }
    this.id = props.id
    this.cardId = props.cardId
    this.description = description
    this.amount = props.amount
    this.installments = props.installments
    this.categoryId = props.categoryId
    this.date = props.date
    this.createdAt = props.createdAt
  }

  static create(props: Omit<CardPurchaseProps, 'id' | 'createdAt'>): CardPurchase {
    return new CardPurchase({ ...props, id: crypto.randomUUID(), createdAt: new Date().toISOString() })
  }

  static restore(props: CardPurchaseProps): CardPurchase {
    return new CardPurchase(props)
  }
}
