import { Account } from '../../domain/accounts/Account'
import type { AccountRepository } from '../../domain/accounts/AccountRepository'
import { Money } from '../../domain/money/Money'
import { FinancialTransaction, type TransactionType } from '../../domain/transactions/FinancialTransaction'
import type { TransactionRepository } from '../../domain/transactions/TransactionRepository'

const DATABASE_NAME = 'stack-finance'
const DATABASE_VERSION = 1
const ACCOUNTS_STORE = 'accounts'
const TRANSACTIONS_STORE = 'transactions'
type StoreName = typeof ACCOUNTS_STORE | typeof TRANSACTIONS_STORE

interface AccountRecord {
  id: string
  name: string
  initialBalanceCents: number
  createdAt: string
}

interface TransactionRecord {
  id: string
  accountId: string
  type: TransactionType
  amountCents: number
  categoryId: string
  description: string
  date: string
  createdAt: string
}

export class IndexedDbFinanceRepository implements AccountRepository, TransactionRepository {
  private databasePromise?: Promise<IDBDatabase>

  async getAllAccounts(): Promise<Account[]> {
    const records = await this.run<AccountRecord[]>(ACCOUNTS_STORE, 'readonly', (store) => store.getAll())
    return records.map((record) => Account.restore({
      id: record.id,
      name: record.name,
      initialBalance: Money.fromCents(record.initialBalanceCents),
      createdAt: record.createdAt,
    }))
  }

  async getAccountById(id: string): Promise<Account | undefined> {
    const record = await this.run<AccountRecord | undefined>(ACCOUNTS_STORE, 'readonly', (store) => store.get(id))
    if (!record) return undefined
    return Account.restore({
      id: record.id,
      name: record.name,
      initialBalance: Money.fromCents(record.initialBalanceCents),
      createdAt: record.createdAt,
    })
  }

  async saveAccount(account: Account): Promise<void> {
    await this.run<IDBValidKey>(ACCOUNTS_STORE, 'readwrite', (store) => store.put({
      id: account.id,
      name: account.name,
      initialBalanceCents: account.initialBalance.cents,
      createdAt: account.createdAt,
    } satisfies AccountRecord))
  }

  async getAllTransactions(): Promise<FinancialTransaction[]> {
    const records = await this.run<TransactionRecord[]>(TRANSACTIONS_STORE, 'readonly', (store) => store.getAll())
    return records.map((record) => FinancialTransaction.restore({
      id: record.id,
      accountId: record.accountId,
      type: record.type,
      amount: Money.fromCents(record.amountCents),
      categoryId: record.categoryId,
      description: record.description,
      date: record.date,
      createdAt: record.createdAt,
    }))
  }

  async saveTransaction(transaction: FinancialTransaction): Promise<void> {
    await this.run<IDBValidKey>(TRANSACTIONS_STORE, 'readwrite', (store) => store.put({
      id: transaction.id,
      accountId: transaction.accountId,
      type: transaction.type,
      amountCents: transaction.amount.cents,
      categoryId: transaction.categoryId,
      description: transaction.description,
      date: transaction.date,
      createdAt: transaction.createdAt,
    } satisfies TransactionRecord))
  }

  async deleteTransactionById(id: string): Promise<void> {
    await this.run<undefined>(TRANSACTIONS_STORE, 'readwrite', (store) => store.delete(id))
  }

  private getDatabase(): Promise<IDBDatabase> {
    if (!this.databasePromise) {
      this.databasePromise = new Promise((resolve, reject) => {
        const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION)
        request.onupgradeneeded = () => {
          const database = request.result
          if (!database.objectStoreNames.contains(ACCOUNTS_STORE)) {
            database.createObjectStore(ACCOUNTS_STORE, { keyPath: 'id' })
          }
          if (!database.objectStoreNames.contains(TRANSACTIONS_STORE)) {
            const store = database.createObjectStore(TRANSACTIONS_STORE, { keyPath: 'id' })
            store.createIndex('accountId', 'accountId', { unique: false })
            store.createIndex('date', 'date', { unique: false })
          }
        }
        request.onsuccess = () => resolve(request.result)
        request.onerror = () => reject(request.error ?? new Error('Não foi possível abrir o banco local.'))
        request.onblocked = () => reject(new Error('Feche outras abas do Stack Finance para atualizar o banco local.'))
      })
    }
    return this.databasePromise
  }

  private async run<T>(
    storeName: StoreName,
    mode: IDBTransactionMode,
    createRequest: (store: IDBObjectStore) => IDBRequest<T>,
  ): Promise<T> {
    const database = await this.getDatabase()
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(storeName, mode)
      let result: T | undefined
      const request = createRequest(transaction.objectStore(storeName))

      request.onsuccess = () => { result = request.result }
      request.onerror = () => reject(request.error ?? new Error('Não foi possível acessar os dados locais.'))
      transaction.oncomplete = () => resolve(result as T)
      transaction.onerror = () => reject(transaction.error ?? new Error('A operação no banco local falhou.'))
      transaction.onabort = () => reject(transaction.error ?? new Error('A operação no banco local foi cancelada.'))
    })
  }
}

