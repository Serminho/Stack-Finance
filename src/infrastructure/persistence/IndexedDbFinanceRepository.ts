import { Account } from '../../domain/accounts/Account'
import type { AccountRepository } from '../../domain/accounts/AccountRepository'
import { Money } from '../../domain/money/Money'
import { FinancialTransaction, type TransactionType } from '../../domain/transactions/FinancialTransaction'
import type { TransactionRepository } from '../../domain/transactions/TransactionRepository'
import { CreditCard } from '../../domain/cards/CreditCard'
import type { CreditCardRepository } from '../../domain/cards/CreditCardRepository'
import { CardPurchase } from '../../domain/cards/CardPurchase'
import type { CardPurchaseRepository } from '../../domain/cards/CardPurchaseRepository'
import { Person } from '../../domain/people/Person'
import type { PersonRepository } from '../../domain/people/PersonRepository'

const DATABASE_NAME = 'stack-finance'
const DATABASE_VERSION = 3
const ACCOUNTS_STORE = 'accounts'
const TRANSACTIONS_STORE = 'transactions'
const CARDS_STORE = 'cards'
type StoreName = typeof ACCOUNTS_STORE | typeof TRANSACTIONS_STORE | typeof CARDS_STORE | 'cardPurchases' | 'people'

interface AccountRecord {
  id: string
  name: string
  initialBalanceCents: number
  createdAt: string
}

interface CardRecord { id: string; name: string; closingDay: number; dueDay: number; createdAt: string }

interface CardPurchaseRecord { id: string; cardId: string; description: string; amountCents: number; installments: number; categoryId: string; date: string; createdAt: string; allocations?: { personId: string; amountCents: number }[] }
interface PersonRecord { id: string; name: string; createdAt: string }

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

export class IndexedDbFinanceRepository implements AccountRepository, TransactionRepository, CreditCardRepository, CardPurchaseRepository, PersonRepository {
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

  async getTransactionById(id: string): Promise<FinancialTransaction | undefined> {
    const record = await this.run<TransactionRecord | undefined>(TRANSACTIONS_STORE, 'readonly', (store) => store.get(id))
    if (!record) return undefined
    return FinancialTransaction.restore({
      id: record.id,
      accountId: record.accountId,
      type: record.type,
      amount: Money.fromCents(record.amountCents),
      categoryId: record.categoryId,
      description: record.description,
      date: record.date,
      createdAt: record.createdAt,
    })
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

  async getAllCards(): Promise<CreditCard[]> {
    const records = await this.run<CardRecord[]>(CARDS_STORE, 'readonly', (store) => store.getAll())
    return records.map((record) => CreditCard.restore(record))
  }

  async getCardById(id: string): Promise<CreditCard | undefined> {
    const record = await this.run<CardRecord | undefined>(CARDS_STORE, 'readonly', (store) => store.get(id))
    return record ? CreditCard.restore(record) : undefined
  }

  async saveCard(card: CreditCard): Promise<void> {
    await this.run<IDBValidKey>(CARDS_STORE, 'readwrite', (store) => store.put({
      id: card.id, name: card.name, closingDay: card.closingDay, dueDay: card.dueDay, createdAt: card.createdAt,
    } satisfies CardRecord))
  }

  async getAllCardPurchases(): Promise<CardPurchase[]> {
    const records = await this.run<CardPurchaseRecord[]>('cardPurchases', 'readonly', (store) => store.getAll())
    return records.map((record) => CardPurchase.restore({
      id: record.id, cardId: record.cardId, description: record.description,
      amount: Money.fromCents(record.amountCents), installments: record.installments,
      allocations: (record.allocations ?? []).map((allocation) => ({ personId: allocation.personId, amount: Money.fromCents(allocation.amountCents) })),
      categoryId: record.categoryId, date: record.date, createdAt: record.createdAt,
    }))
  }

  async saveCardPurchase(purchase: CardPurchase): Promise<void> {
    await this.run<IDBValidKey>('cardPurchases', 'readwrite', (store) => store.put({
      id: purchase.id, cardId: purchase.cardId, description: purchase.description,
      amountCents: purchase.amount.cents, installments: purchase.installments,
      allocations: purchase.allocations.map((allocation) => ({ personId: allocation.personId, amountCents: allocation.amount.cents })),
      categoryId: purchase.categoryId, date: purchase.date, createdAt: purchase.createdAt,
    } satisfies CardPurchaseRecord))
  }
  async getAllPeople(): Promise<Person[]> {
    const records = await this.run<PersonRecord[]>('people', 'readonly', (store) => store.getAll())
    return records.map((record) => Person.restore(record))
  }

  async getPersonById(id: string): Promise<Person | undefined> {
    const record = await this.run<PersonRecord | undefined>('people', 'readonly', (store) => store.get(id))
    return record ? Person.restore(record) : undefined
  }

  async savePerson(person: Person): Promise<void> {
    await this.run<IDBValidKey>('people', 'readwrite', (store) => store.put({ id: person.id, name: person.name, createdAt: person.createdAt } satisfies PersonRecord))
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
          if (!database.objectStoreNames.contains('people')) {
            database.createObjectStore('people', { keyPath: 'id' })
          }
          if (!database.objectStoreNames.contains(CARDS_STORE)) {
            database.createObjectStore(CARDS_STORE, { keyPath: 'id' })
          }
          if (!database.objectStoreNames.contains('cardPurchases')) {
            const store = database.createObjectStore('cardPurchases', { keyPath: 'id' })
            store.createIndex('cardId', 'cardId', { unique: false })
            store.createIndex('date', 'date', { unique: false })
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








