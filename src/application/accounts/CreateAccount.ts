import { Account } from '../../domain/accounts/Account'
import type { AccountRepository } from '../../domain/accounts/AccountRepository'
import { Money } from '../../domain/money/Money'

export type CreateAccountInput = {
  name: string
  initialBalance: string
}

export class CreateAccount {
  constructor(private readonly accounts: AccountRepository) {}

  async execute(input: CreateAccountInput): Promise<Account> {
    const account = Account.create(input.name, Money.fromInput(input.initialBalance, true))
    await this.accounts.saveAccount(account)
    return account
  }
}

