import { Money } from '../money/Money'

export type TransactionType = 'income' | 'expense'

export type FinancialTransactionProps = {
  id: string
  accountId: string
  type: TransactionType
  amount: Money
  categoryId: string
  description: string
  date: string
  createdAt: string
}

export class FinancialTransaction {
  readonly id: string
  readonly accountId: string
  readonly type: TransactionType
  readonly amount: Money
  readonly categoryId: string
  readonly description: string
  readonly date: string
  readonly createdAt: string

  private constructor(props: FinancialTransactionProps) {
    const description = props.description.trim()
    if (!description) throw new Error('Informe uma descrição para a movimentação.')
    if (props.amount.cents <= 0) throw new Error('O valor precisa ser maior que zero.')
    if (!/^\d{4}-\d{2}-\d{2}$/.test(props.date) || Number.isNaN(Date.parse(`${props.date}T12:00:00`))) {
      throw new Error('Informe uma data válida.')
    }

    this.id = props.id
    this.accountId = props.accountId
    this.type = props.type
    this.amount = props.amount
    this.categoryId = props.categoryId
    this.description = description
    this.date = props.date
    this.createdAt = props.createdAt
  }

  static create(props: Omit<FinancialTransactionProps, 'id' | 'createdAt'>): FinancialTransaction {
    return new FinancialTransaction({
      ...props,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    })
  }

  static revise(
    existing: FinancialTransaction,
    changes: Omit<FinancialTransactionProps, 'id' | 'createdAt'>,
  ): FinancialTransaction {
    return new FinancialTransaction({ ...changes, id: existing.id, createdAt: existing.createdAt })
  }
  static restore(props: FinancialTransactionProps): FinancialTransaction {
    return new FinancialTransaction(props)
  }
}

