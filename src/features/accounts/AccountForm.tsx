import { useState, type FormEvent } from 'react'

export type AccountFormValues = {
  name: string
  initialBalance: string
}

type AccountFormProps = {
  onSubmit: (values: AccountFormValues) => Promise<void>
  onCancel: () => void
}

function AccountForm({ onSubmit, onCancel }: AccountFormProps) {
  const [name, setName] = useState('')
  const [initialBalance, setInitialBalance] = useState('0')
  const [error, setError] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setIsSaving(true)
    try {
      await onSubmit({ name, initialBalance })
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível salvar a conta.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form className="form-stack" onSubmit={handleSubmit}>
      <label className="field">
        <span>Nome da conta</span>
        <input autoFocus maxLength={50} onChange={(event) => setName(event.target.value)} placeholder="Ex.: Conta principal" required value={name} />
      </label>
      <label className="field">
        <span>Saldo inicial</span>
        <div className="input-with-prefix"><span>R$</span><input inputMode="decimal" onChange={(event) => setInitialBalance(event.target.value)} placeholder="0,00" required value={initialBalance} /></div>
        <small>Use 0 se estiver começando a acompanhar agora.</small>
      </label>
      {error && <p className="form-error" role="alert">{error}</p>}
      <div className="form-actions">
        <button className="button button-quiet" onClick={onCancel} type="button">Cancelar</button>
        <button className="button button-primary" disabled={isSaving} type="submit">{isSaving ? 'Salvando…' : 'Salvar conta'}</button>
      </div>
    </form>
  )
}

export default AccountForm
