export type CreditCardProps = {
  id: string
  name: string
  closingDay: number
  dueDay: number
  createdAt: string
}

export class CreditCard {
  readonly id: string
  readonly name: string
  readonly closingDay: number
  readonly dueDay: number
  readonly createdAt: string

  private constructor(props: CreditCardProps) {
    const name = props.name.trim()
    if (!name) throw new Error('Informe um nome para o cartão.')
    if (!Number.isInteger(props.closingDay) || props.closingDay < 1 || props.closingDay > 31) {
      throw new Error('O fechamento deve ser um dia entre 1 e 31.')
    }
    if (!Number.isInteger(props.dueDay) || props.dueDay < 1 || props.dueDay > 31) {
      throw new Error('O vencimento deve ser um dia entre 1 e 31.')
    }
    this.id = props.id
    this.name = name
    this.closingDay = props.closingDay
    this.dueDay = props.dueDay
    this.createdAt = props.createdAt
  }

  static create(name: string, closingDay: number, dueDay: number): CreditCard {
    return new CreditCard({ id: crypto.randomUUID(), name, closingDay, dueDay, createdAt: new Date().toISOString() })
  }

  static restore(props: CreditCardProps): CreditCard {
    return new CreditCard(props)
  }
}
