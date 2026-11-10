import { Money } from '../money/Money'

export type PurchaseAllocation = { personId: string; amount: Money }

export type CardPurchaseProps = {
  id: string
  cardId: string
  description: string
  amount: Money
  installments: number
  categoryId: string
  date: string
  createdAt: string
  allocations?: PurchaseAllocation[]
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
  readonly allocations: PurchaseAllocation[]

  private constructor(props: CardPurchaseProps) {
    const description = props.description.trim()
    const allocations = props.allocations ?? []
    if (!description) throw new Error('Informe uma descrição para a compra.')
    if (props.amount.cents <= 0) throw new Error('O valor da compra precisa ser maior que zero.')
    if (!Number.isInteger(props.installments) || props.installments < 1 || props.installments > 36) throw new Error('Escolha de 1 a 36 parcelas.')
    if (!/^\d{4}-\d{2}-\d{2}$/.test(props.date) || Number.isNaN(Date.parse(`${props.date}T12:00:00`))) throw new Error('Informe uma data válida para a compra.')
    if (allocations.length > 0) {
      const participantIds = allocations.map((allocation) => allocation.personId)
      if (new Set(participantIds).size !== participantIds.length) throw new Error('Cada pessoa pode aparecer uma vez na divisão.')
      if (allocations.some((allocation) => !allocation.personId || allocation.amount.cents <= 0)) throw new Error('Cada parte precisa ser maior que zero.')
      const allocatedCents = allocations.reduce((total, allocation) => total + allocation.amount.cents, 0)
      if (allocatedCents !== props.amount.cents) throw new Error('As partes devem somar exatamente o valor da compra.')
    }
    this.id = props.id
    this.cardId = props.cardId
    this.description = description
    this.amount = props.amount
    this.installments = props.installments
    this.categoryId = props.categoryId
    this.date = props.date
    this.createdAt = props.createdAt
    this.allocations = allocations
  }

  static create(props: Omit<CardPurchaseProps, 'id' | 'createdAt'> & { allocations: PurchaseAllocation[] }): CardPurchase {
    if (props.allocations.length === 0) throw new Error('Divida a compra entre pelo menos uma pessoa.')
    return new CardPurchase({ ...props, id: crypto.randomUUID(), createdAt: new Date().toISOString() })
  }

  static restore(props: CardPurchaseProps): CardPurchase {
    return new CardPurchase(props)
  }
}




