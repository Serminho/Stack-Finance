import { useState, type FormEvent } from 'react'
import type { Account } from '../../domain/accounts/Account'
import { categoriesFor } from '../../domain/transactions/TransactionCategory'
import type { TransactionType } from '../../domain/transactions/FinancialTransaction'

export type TransactionFormValues = {
  accountId: string
  type: TransactionType
  amount: string
  categoryId: string
  description: string
  date: string
}

type TransactionFormProps = {
  accounts: Account[]
  onSubmit: (values: TransactionFormValues) => Promise<void>
  onCancel: () => void
  initialValues?: TransactionFormValues
}

function localDate(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function TransactionForm({ accounts, onSubmit, onCancel, initialValues }: TransactionFormProps) {
  const [type, setType] = useState<TransactionType>(initialValues?.type ?? 'expense')
  const [accountId, setAccountId] = useState(initialValues?.accountId ?? accounts[0]?.id ?? '')
  const [categoryId, setCategoryId] = useState(initialValues?.categoryId ?? categoriesFor(initialValues?.type ?? 'expense')[0]?.id ?? '')
  const [amount, setAmount] = useState(initialValues?.amount ?? '')
  const [description, setDescription] = useState(initialValues?.description ?? '')
  const [date, setDate] = useState(initialValues?.date ?? localDate)
  const [error, setError] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  function changeType(nextType: TransactionType) {
    setType(nextType)
    setCategoryId(categoriesFor(nextType)[0]?.id ?? '')
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setIsSaving(true)
    try {
      await onSubmit({ accountId, type, amount, categoryId, description, date })
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível salvar a movimentação.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form className="form-stack" onSubmit={handleSubmit}>
      <div className="field">
        <span>Tipo de movimentação</span>
        <div className="segmented-control" role="group" aria-label="Tipo de movimentação">
          <button className={type === 'expense' ? 'selected expense-choice' : ''} onClick={() => changeType('expense')} type="button">Despesa</button>
          <button className={type === 'income' ? 'selected income-choice' : ''} onClick={() => changeType('income')} type="button">Receita</button>
        </div>
      </div>
      <label className="field">
        <span>Descrição</span>
        <input autoFocus maxLength={80} onChange={(event) => setDescription(event.target.value)} placeholder="Ex.: Mercado da semana" required value={description} />
      </label>
      <div className="form-grid">
        <label className="field">
          <span>Valor</span>
          <div className="input-with-prefix"><span>R$</span><input inputMode="decimal" onChange={(event) => setAmount(event.target.value)} placeholder="0,00" required value={amount} /></div>
        </label>
        <label className="field">
          <span>Data</span>
          <input onChange={(event) => setDate(event.target.value)} required type="date" value={date} />
        </label>
      </div>
      <div className="form-grid">
        <label className="field">
          <span>Categoria</span>
          <select onChange={(event) => setCategoryId(event.target.value)} required value={categoryId}>
            {categoriesFor(type).map((category) => <option key={category.id} value={category.id}>{category.label}</option>)}
          </select>
        </label>
        <label className="field">
          <span>Conta</span>
          <select onChange={(event) => setAccountId(event.target.value)} required value={accountId}>
            {accounts.map((account) => <option key={account.id} value={account.id}>{account.name}</option>)}
          </select>
        </label>
      </div>
      {error && <p className="form-error" role="alert">{error}</p>}
      <div className="form-actions">
        <button className="button button-quiet" onClick={onCancel} type="button">Cancelar</button>
        <button className="button button-primary" disabled={isSaving} type="submit">{isSaving ? 'Salvando…' : 'Salvar alterações'}</button>
      </div>
    </form>
  )
}

export default TransactionForm


