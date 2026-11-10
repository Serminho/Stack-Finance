import { useState, type FormEvent } from 'react'
import type { Person } from '../../domain/people/Person'
import { Money } from '../../domain/money/Money'
import { categoriesFor } from '../../domain/transactions/TransactionCategory'

export type CardPurchaseFormValues = { cardId: string; description: string; amount: string; installments: number; categoryId: string; date: string; allocations: { personId: string; amount: string }[] }
type Props = { cardId: string; people: Person[]; onSubmit: (values: CardPurchaseFormValues) => Promise<void>; onCancel: () => void }

function localDate(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

function centsFromInput(value: string): number {
  try { return Money.fromInput(value).cents } catch { return 0 }
}

function CardPurchaseForm({ cardId, people, onSubmit, onCancel }: Props) {
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [installments, setInstallments] = useState('1')
  const [categoryId, setCategoryId] = useState(categoriesFor('expense')[0]?.id ?? '')
  const [date, setDate] = useState(localDate)
  const [allocations, setAllocations] = useState<Record<string, string>>({})
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const allocatedCents = Object.values(allocations).reduce((total, value) => total + centsFromInput(value), 0)
  const purchaseCents = centsFromInput(amount)
  const divisionIsComplete = allocatedCents === purchaseCents && purchaseCents > 0

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setSaving(true)
    try {
      await onSubmit({
        cardId, description, amount, installments: Number(installments), categoryId, date,
        allocations: people.filter((person) => allocations[person.id]?.trim()).map((person) => ({ personId: person.id, amount: allocations[person.id] })),
      })
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível salvar a compra.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form className="form-stack" onSubmit={handleSubmit}>
      <label className="field"><span>Descrição</span><input autoFocus maxLength={80} onChange={(event) => setDescription(event.target.value)} placeholder="Ex.: Fone de ouvido" required value={description} /></label>
      <div className="form-grid">
        <label className="field"><span>Valor total</span><div className="input-with-prefix"><span>R$</span><input inputMode="decimal" onChange={(event) => setAmount(event.target.value)} placeholder="0,00" required value={amount} /></div></label>
        <label className="field"><span>Parcelas</span><select onChange={(event) => setInstallments(event.target.value)} value={installments}>{Array.from({ length: 36 }, (_, index) => index + 1).map((count) => <option key={count} value={count}>{count}x</option>)}</select></label>
      </div>
      <div className="form-grid">
        <label className="field"><span>Data da compra</span><input onChange={(event) => setDate(event.target.value)} required type="date" value={date} /></label>
        <label className="field"><span>Categoria</span><select onChange={(event) => setCategoryId(event.target.value)} required value={categoryId}>{categoriesFor('expense').map((category) => <option key={category.id} value={category.id}>{category.label}</option>)}</select></label>
      </div>
      <fieldset className="allocation-fieldset">
        <legend>Quem ficou com a despesa?</legend>
        {people.length === 0 ? <p className="no-people">Cadastre pessoas antes de dividir esta compra.</p> : people.map((person) => (
          <label className="allocation-row" key={person.id}>
            <span>{person.name}</span>
            <span className="input-with-prefix"><span>R$</span><input inputMode="decimal" onChange={(event) => setAllocations((current) => ({ ...current, [person.id]: event.target.value }))} placeholder="0,00" value={allocations[person.id] ?? ''} /></span>
          </label>
        ))}
        {people.length > 0 && <p className={`allocation-total ${divisionIsComplete ? 'allocation-valid' : 'allocation-invalid'}`}>{divisionIsComplete ? 'Divisão fechada' : `Distribuído ${Money.fromCents(allocatedCents).format()} de ${Money.fromCents(purchaseCents).format()}`}</p>}
      </fieldset>
      {error && <p className="form-error" role="alert">{error}</p>}
      <div className="form-actions"><button className="button button-quiet" onClick={onCancel} type="button">Cancelar</button><button className="button button-primary" disabled={saving || people.length === 0 || !divisionIsComplete} type="submit">{saving ? 'Salvando…' : 'Salvar compra'}</button></div>
    </form>
  )
}

export default CardPurchaseForm
