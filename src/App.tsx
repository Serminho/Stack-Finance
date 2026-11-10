import { useCallback, useEffect, useState } from 'react'
import { CreateAccount } from './application/accounts/CreateAccount'
import { CreateCardPurchase } from './application/cards/CreateCardPurchase'
import { CreateCreditCard } from './application/cards/CreateCreditCard'
import { GetCardForecast, type CardForecastView } from './application/cards/GetCardForecast'
import { GetFinanceOverview, type FinanceOverview } from './application/finance/GetFinanceOverview'
import { CreateTransaction } from './application/transactions/CreateTransaction'
import { DeleteTransaction } from './application/transactions/DeleteTransaction'
import { UpdateTransaction } from './application/transactions/UpdateTransaction'
import type { CardPurchaseFormValues } from './features/cards/CardPurchaseForm'
import CardPurchaseForm from './features/cards/CardPurchaseForm'
import CardForecastPanel from './features/cards/CardForecastPanel'
import type { CreditCardFormValues } from './features/cards/CreditCardForm'
import CreditCardForm from './features/cards/CreditCardForm'
import AccountForm, { type AccountFormValues } from './features/accounts/AccountForm'
import Modal from './features/shared/Modal'
import TransactionForm, { type TransactionFormValues } from './features/transactions/TransactionForm'
import TransactionList from './features/transactions/TransactionList'
import { Money } from './domain/money/Money'
import type { FinancialTransaction } from './domain/transactions/FinancialTransaction'
import { IndexedDbFinanceRepository } from './infrastructure/persistence/IndexedDbFinanceRepository'

const repository = new IndexedDbFinanceRepository()
const createAccount = new CreateAccount(repository)
const createTransaction = new CreateTransaction(repository, repository)
const deleteTransaction = new DeleteTransaction(repository)
const updateTransaction = new UpdateTransaction(repository, repository)
const getFinanceOverview = new GetFinanceOverview(repository, repository)
const createCreditCard = new CreateCreditCard(repository)
const createCardPurchase = new CreateCardPurchase(repository, repository)
const getCardForecast = new GetCardForecast(repository, repository)

type ActiveModal = 'account' | 'transaction' | 'card' | 'purchase' | null

function currentMonth(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

function monthTitle(month: string): string {
  const [year, monthNumber] = month.split('-').map(Number)
  const label = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(new Date(year, monthNumber - 1, 1))
  return label.charAt(0).toUpperCase() + label.slice(1)
}

function StackMark() {
  return <span aria-hidden="true" className="brand-mark"><span /><span /><span /></span>
}

function SummaryCard({ label, value, tone, detail }: { label: string; value: Money; tone?: string; detail: string }) {
  return <article className={`summary-card ${tone ?? ''}`}><div className="summary-card-top"><span>{label}</span><span className="summary-mark" aria-hidden="true" /></div><strong className="summary-value">{value.format()}</strong><span className="summary-detail">{detail}</span></article>
}

function App() {
  const [selectedMonth, setSelectedMonth] = useState(currentMonth)
  const [overview, setOverview] = useState<FinanceOverview | null>(null)
  const [cardForecast, setCardForecast] = useState<CardForecastView>({ cards: [], invoices: [] })
  const [modal, setModal] = useState<ActiveModal>(null)
  const [editingTransaction, setEditingTransaction] = useState<FinancialTransaction | null>(null)
  const [selectedCardId, setSelectedCardId] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [pageError, setPageError] = useState('')

  const refreshOverview = useCallback(async () => {
    setIsLoading(true)
    setPageError('')
    try {
      const [financeData, cardData] = await Promise.all([
        getFinanceOverview.execute(selectedMonth),
        getCardForecast.execute(),
      ])
      setOverview(financeData)
      setCardForecast(cardData)
    } catch (cause) {
      setPageError(cause instanceof Error ? cause.message : 'Não foi possível carregar os dados locais.')
    } finally {
      setIsLoading(false)
    }
  }, [selectedMonth])

  useEffect(() => { void refreshOverview() }, [refreshOverview])

  async function handleCreateAccount(values: AccountFormValues) {
    await createAccount.execute(values)
    await refreshOverview()
    setModal(null)
  }

  async function handleCreateTransaction(values: TransactionFormValues) {
    await createTransaction.execute(values)
    await refreshOverview()
    setModal(null)
  }

  async function handleUpdateTransaction(values: TransactionFormValues) {
    if (!editingTransaction) return
    await updateTransaction.execute({ ...values, id: editingTransaction.id })
    setEditingTransaction(null)
    setModal(null)
    await refreshOverview()
  }

  async function handleDeleteTransaction(id: string) {
    if (!window.confirm('Excluir esta movimentação? O saldo será recalculado.')) return
    try {
      await deleteTransaction.execute(id)
      await refreshOverview()
    } catch (cause) {
      setPageError(cause instanceof Error ? cause.message : 'Não foi possível excluir a movimentação.')
    }
  }

  async function handleCreateCard(values: CreditCardFormValues) {
    await createCreditCard.execute(values)
    await refreshOverview()
    setModal(null)
  }

  async function handleCreatePurchase(values: CardPurchaseFormValues) {
    await createCardPurchase.execute(values)
    await refreshOverview()
    setModal(null)
    setSelectedCardId('')
  }

  const accounts = overview?.accounts.map((item) => item.account) ?? []
  const hasAccounts = accounts.length > 0

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#inicio" aria-label="Stack Finance, início"><StackMark /><span>stack<span className="brand-accent">finance</span></span></a>
        <span className="local-badge"><span /> SEUS DADOS FICAM NESTE DISPOSITIVO</span>
      </header>

      <main className="dashboard" id="inicio">
        <div className="page-heading">
          <div><p className="eyebrow"><span className="eyebrow-line" /> PAINEL FINANCEIRO</p><h1>Visão geral</h1><p className="page-subtitle">Acompanhe seu saldo e as movimentações do mês.</p></div>
          <div className="heading-actions">
            <button className="button button-secondary" onClick={() => setModal('account')} type="button">＋ Nova conta</button>
            <button className="button button-primary" disabled={!hasAccounts} onClick={() => { setEditingTransaction(null); setModal('transaction') }} type="button">＋ Movimentação</button>
          </div>
        </div>

        {pageError && <div className="page-error" role="alert"><span>{pageError}</span><button className="icon-button" onClick={() => setPageError('')} type="button" aria-label="Fechar aviso">×</button></div>}

        <section aria-label="Resumo financeiro" className="summary-grid">
          <SummaryCard detail="Em todas as contas" label="Saldo atual" value={overview?.totalBalance ?? Money.zero()} />
          <SummaryCard detail={monthTitle(selectedMonth)} label="Entradas do mês" tone="summary-income" value={overview?.monthlyIncome ?? Money.zero()} />
          <SummaryCard detail={monthTitle(selectedMonth)} label="Saídas do mês" tone="summary-expense" value={overview?.monthlyExpenses ?? Money.zero()} />
        </section>

        <div className="dashboard-grid">
          <section aria-labelledby="accounts-title" className="panel accounts-panel">
            <div className="panel-heading"><div><span className="panel-kicker">SEU DINHEIRO</span><h2 id="accounts-title">Contas</h2></div><button aria-label="Adicionar conta" className="icon-button add-button" onClick={() => setModal('account')} type="button">＋</button></div>
            {isLoading ? <p className="subtle-message">Carregando contas…</p> : hasAccounts ? (
              <ul className="account-list">{overview?.accounts.map(({ account, balance }) => <li className="account-row" key={account.id}><span className="account-icon" aria-hidden="true">▤</span><span className="account-name"><strong>{account.name}</strong><small>Saldo inicial {account.initialBalance.format()}</small></span><strong className="account-balance">{balance.format()}</strong></li>)}</ul>
            ) : <div className="empty-accounts"><p>Cadastre uma conta para começar a organizar seu saldo.</p><button className="text-button" onClick={() => setModal('account')} type="button">Criar primeira conta <span>→</span></button></div>}
            {hasAccounts && <button className="add-account-link" onClick={() => setModal('account')} type="button">＋ Adicionar conta</button>}
          </section>

          <section aria-labelledby="transactions-title" className="panel transactions-panel">
            <div className="panel-heading transaction-heading"><div><span className="panel-kicker">ENTRADAS E SAÍDAS</span><h2 id="transactions-title">Movimentações</h2></div><label className="month-picker"><span className="sr-only">Mês das movimentações</span><input aria-label="Mês das movimentações" onChange={(event) => setSelectedMonth(event.target.value)} type="month" value={selectedMonth} /></label></div>
            <p className="month-label">{monthTitle(selectedMonth)}</p>
            {isLoading ? <p className="subtle-message">Carregando movimentações…</p> : <TransactionList accounts={accounts} onDelete={(id) => void handleDeleteTransaction(id)} onEdit={(transaction) => { setEditingTransaction(transaction); setModal('transaction') }} transactions={overview?.transactions ?? []} />}
          </section>
        </div>

        <CardForecastPanel cards={cardForecast.cards} invoices={cardForecast.invoices} onAddCard={() => setModal('card')} onAddPurchase={(cardId) => { setSelectedCardId(cardId); setModal('purchase') }} />
      </main>

      <footer className="footer"><span>STACK FINANCE</span><span>Suas movimentações, organizadas com clareza.</span></footer>

      {modal === 'account' && <Modal onClose={() => setModal(null)} title="Nova conta"><AccountForm onCancel={() => setModal(null)} onSubmit={handleCreateAccount} /></Modal>}
      {modal === 'transaction' && <Modal onClose={() => { setModal(null); setEditingTransaction(null) }} title={editingTransaction ? 'Editar movimentação' : 'Nova movimentação'}><TransactionForm key={editingTransaction?.id ?? 'new'} accounts={accounts} initialValues={editingTransaction ? { accountId: editingTransaction.accountId, type: editingTransaction.type, amount: (editingTransaction.amount.cents / 100).toFixed(2).replace('.', ','), categoryId: editingTransaction.categoryId, description: editingTransaction.description, date: editingTransaction.date } : undefined} onCancel={() => { setModal(null); setEditingTransaction(null) }} onSubmit={editingTransaction ? handleUpdateTransaction : handleCreateTransaction} /></Modal>}
      {modal === 'card' && <Modal onClose={() => setModal(null)} title="Novo cartão"><CreditCardForm onCancel={() => setModal(null)} onSubmit={handleCreateCard} /></Modal>}
      {modal === 'purchase' && <Modal onClose={() => { setModal(null); setSelectedCardId('') }} title="Registrar compra"><CardPurchaseForm cardId={selectedCardId} onCancel={() => { setModal(null); setSelectedCardId('') }} onSubmit={handleCreatePurchase} /></Modal>}
    </div>
  )
}

export default App
