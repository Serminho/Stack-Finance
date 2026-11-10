import { useState } from 'react'
import type { Account } from '../../domain/accounts/Account'
import { filterTransactions } from '../../application/transactions/filterTransactions'
import { Money } from '../../domain/money/Money'
import type { FinancialTransaction } from '../../domain/transactions/FinancialTransaction'
import { categoryById, TRANSACTION_CATEGORIES } from '../../domain/transactions/TransactionCategory'

type TransactionListProps = {
  transactions: FinancialTransaction[]
  accounts: Account[]
  onDelete: (id: string) => void
  onEdit: (transaction: FinancialTransaction) => void
}

function formatDate(date: string): string {
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' })
    .format(new Date(`${date}T12:00:00`))
    .replace('.', '')
}

function TransactionList({ transactions, accounts, onDelete, onEdit }: TransactionListProps) {
  const [accountId, setAccountId] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const visibleTransactions = filterTransactions(transactions, { accountId, categoryId })

  if (transactions.length === 0) {
    return (
      <div className="empty-state">
        <span className="empty-icon" aria-hidden="true">＋</span>
        <strong>Nenhuma movimentação neste mês</strong>
        <p>Adicione uma receita ou despesa para começar seu acompanhamento.</p>
      </div>
    )
  }

  return (
    <>
      <div className="transaction-filters" aria-label="Filtros de movimentações">
        <label>
          <span className="sr-only">Filtrar por conta</span>
          <select aria-label="Filtrar por conta" onChange={(event) => setAccountId(event.target.value)} value={accountId}>
            <option value="">Todas as contas</option>
            {accounts.map((account) => <option key={account.id} value={account.id}>{account.name}</option>)}
          </select>
        </label>
        <label>
          <span className="sr-only">Filtrar por categoria</span>
          <select aria-label="Filtrar por categoria" onChange={(event) => setCategoryId(event.target.value)} value={categoryId}>
            <option value="">Todas as categorias</option>
            {TRANSACTION_CATEGORIES.map((category) => <option key={category.id} value={category.id}>{category.label}</option>)}
          </select>
        </label>
      </div>
      {visibleTransactions.length === 0 ? (
        <div className="filtered-empty">Nenhuma movimentação corresponde aos filtros.</div>
      ) : (
        <ul className="transaction-list">
          {visibleTransactions.map((transaction) => {
            const category = categoryById(transaction.categoryId)
            const account = accounts.find((item) => item.id === transaction.accountId)
            const isIncome = transaction.type === 'income'
            return (
              <li className="transaction-row" key={transaction.id}>
                <span className={`transaction-symbol ${isIncome ? 'symbol-income' : 'symbol-expense'}`} aria-hidden="true">{isIncome ? '↗' : '↘'}</span>
                <div className="transaction-main">
                  <strong>{transaction.description}</strong>
                  <span>{category?.label ?? 'Categoria'} <i>·</i> {account?.name ?? 'Conta removida'}</span>
                </div>
                <time className="transaction-date" dateTime={transaction.date}>{formatDate(transaction.date)}</time>
                <strong className={`transaction-amount ${isIncome ? 'amount-income' : ''}`}>
                  {isIncome ? '+' : '−'}{Money.fromCents(transaction.amount.cents).format()}
                </strong>
                <button className="icon-button edit-button" aria-label={`Editar ${transaction.description}`} onClick={() => onEdit(transaction)} type="button" title="Editar movimentação">✎</button>
                <button className="icon-button delete-button" aria-label={`Excluir ${transaction.description}`} onClick={() => onDelete(transaction.id)} type="button" title="Excluir movimentação">×</button>
              </li>
            )
          })}
        </ul>
      )}
    </>
  )
}

export default TransactionList
