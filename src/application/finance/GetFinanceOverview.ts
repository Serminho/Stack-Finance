import type { Account } from '../../domain/accounts/Account'
import type { AccountRepository } from '../../domain/accounts/AccountRepository'
import { Money } from '../../domain/money/Money'
import type { FinancialTransaction } from '../../domain/transactions/FinancialTransaction'
import type { TransactionRepository } from '../../domain/transactions/TransactionRepository'

export type AccountBalance = {
  account: Account
  balance: Money
}

export type FinanceOverview = {
  totalBalance: Money
  monthlyIncome: Money
  monthlyExpenses: Money
  accounts: AccountBalance[]
  transactions: FinancialTransaction[]
}

export class GetFinanceOverview {
  constructor(
    private readonly accounts: AccountRepository,
    private readonly transactions: TransactionRepository,
  ) {}

  async execute(month: string): Promise<FinanceOverview> {
    const [accounts, transactions] = await Promise.all([
      this.accounts.getAllAccounts(),
      this.transactions.getAllTransactions(),
    ])

    const monthlyTransactions = transactions.filter((transaction) => transaction.date.startsWith(month))
    let monthlyIncome = Money.zero()
    let monthlyExpenses = Money.zero()

    for (const transaction of monthlyTransactions) {
      if (transaction.type === 'income') monthlyIncome = monthlyIncome.plus(transaction.amount)
      else monthlyExpenses = monthlyExpenses.plus(transaction.amount)
    }

    const accountBalances = accounts.map((account) => {
      let balance = account.initialBalance
      for (const transaction of transactions) {
        if (transaction.accountId !== account.id) continue
        balance = transaction.type === 'income'
          ? balance.plus(transaction.amount)
          : balance.minus(transaction.amount)
      }
      return { account, balance }
    })

    const totalBalance = accountBalances.reduce(
      (total, item) => total.plus(item.balance),
      Money.zero(),
    )

    return {
      totalBalance,
      monthlyIncome,
      monthlyExpenses,
      accounts: accountBalances,
      transactions: monthlyTransactions.sort((a, b) =>
        b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt),
      ),
    }
  }
}

