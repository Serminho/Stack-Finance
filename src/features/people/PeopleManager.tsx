import { useState, type FormEvent } from 'react'
import type { Person } from '../../domain/people/Person'

type Props = { people: Person[]; onCreate: (name: string) => Promise<void>; onClose: () => void }

function PeopleManager({ people, onCreate, onClose }: Props) {
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setSaving(true)
    try {
      await onCreate(name)
      setName('')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível cadastrar a pessoa.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="people-manager">
      <p className="form-hint">Cadastre quem participa das compras deste cartão. Depois, distribua o valor de cada compra entre essas pessoas.</p>
      <form className="person-create-form" onSubmit={handleSubmit}>
        <label className="field"><span>Nome</span><input autoFocus maxLength={50} onChange={(event) => setName(event.target.value)} placeholder="Ex.: Alex" required value={name} /></label>
        <button className="button button-primary" disabled={saving} type="submit">{saving ? 'Salvando…' : 'Adicionar pessoa'}</button>
      </form>
      {error && <p className="form-error" role="alert">{error}</p>}
      <ul className="people-list">{people.map((person) => <li key={person.id}><span className="person-avatar" aria-hidden="true">{person.name.charAt(0).toUpperCase()}</span><strong>{person.name}</strong></li>)}</ul>
      {people.length === 0 && <p className="no-people">Ainda não há pessoas cadastradas.</p>}
      <div className="form-actions"><button className="button button-quiet" onClick={onClose} type="button">Fechar</button></div>
    </div>
  )
}

export default PeopleManager
