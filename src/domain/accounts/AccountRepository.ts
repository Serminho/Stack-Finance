import type { Account } from './Account'

export interface AccountRepository {
  getAllAccounts(): Promise<Account[]>
  getAccountById(id: string): Promise<Account | undefined>
  saveAccount(account: Account): Promise<void>
}
