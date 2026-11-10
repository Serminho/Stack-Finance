import { Money } from '../money/Money'

export type AccountProps = {
  id: string
  name: string
  initialBalance: Money
  createdAt: string
}

export class Account {
  readonly id: string
  readonly name: string
  readonly initialBalance: Money
  readonly createdAt: string

  private constructor(props: AccountProps) {
    const name = props.name.trim()
    if (!name) throw new Error('Informe um nome para a conta.')
    if (props.initialBalance.cents < 0) throw new Error('O saldo inicial não pode ser negativo.')

    this.id = props.id
    this.name = name
    this.initialBalance = props.initialBalance
    this.createdAt = props.createdAt
  }

  static create(name: string, initialBalance: Money): Account {
    return new Account({
      id: crypto.randomUUID(),
      name,
      initialBalance,
      createdAt: new Date().toISOString(),
    })
  }

  static restore(props: AccountProps): Account {
    return new Account(props)
  }
}
