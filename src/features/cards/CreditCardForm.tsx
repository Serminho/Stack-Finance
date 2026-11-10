import { useState, type FormEvent } from 'react'

export type CreditCardFormValues = { name: string; closingDay: number; dueDay: number }
type Props = { onSubmit: (values: CreditCardFormValues) => Promise<void>; onCancel: () => void }

function CreditCardForm({ onSubmit, onCancel }: Props) {
  const [name, setName] = useState('')
  const [closingDay, setClosingDay] = useState('20')
  const [dueDay, setDueDay] = useState('5')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setSaving(true)
    try {
      await onSubmit({ name, closingDay: Number(closingDay), dueDay: Number(dueDay) })
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível salvar o cartão.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form className="form-stack" onSubmit={handleSubmit}>
      <label className="field"><span>Nome do cartão</span><input autoFocus maxLength={50} onChange={(event) => setName(event.target.value)} placeholder="Ex.: Cartão principal" required value={name} /></label>
      <div className="form-grid">
        <label className="field"><span>Dia de fechamento</span><input max="31" min="1" onChange={(event) => setClosingDay(event.target.value)} required type="number" value={closingDay} /></label>
        <label className="field"><span>Dia de vencimento</span><input max="31" min="1" onChange={(event) => setDueDay(event.target.value)} required type="number" value={dueDay} /></label>
      </div>
      <small className="form-hint">O dia é ajustado para o último dia quando o mês for mais curto.</small>
      {error && <p className="form-error" role="alert">{error}</p>}
      <div className="form-actions"><button className="button button-quiet" onClick={onCancel} type="button">Cancelar</button><button className="button button-primary" disabled={saving} type="submit">{saving ? 'Salvando…' : 'Salvar cartão'}</button></div>
    </form>
  )
}

export default CreditCardForm
