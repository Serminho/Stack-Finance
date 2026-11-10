import type { CreditCard } from '../../domain/cards/CreditCard'
import type { Person } from '../../domain/people/Person'
import type { InvoiceForecast } from '../../application/cards/BuildInvoiceForecast'

type Props = {
  cards: CreditCard[]
  people: Person[]
  invoices: InvoiceForecast[]
  onAddCard: () => void
  onAddPurchase: (cardId: string) => void
  onManagePeople: () => void
}

function dateLabel(date: string): string {
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(`${date}T12:00:00`)).replace('.', '')
}

function CardForecastPanel({ cards, people, invoices, onAddCard, onAddPurchase, onManagePeople }: Props) {
  return (
    <section aria-labelledby="cards-title" className="panel cards-panel">
      <div className="panel-heading">
        <div><span className="panel-kicker">CARTÕES E COMPROMISSOS</span><h2 id="cards-title">Próximas faturas</h2></div>
        <div className="card-panel-actions"><button className="button button-secondary card-add-button" onClick={onManagePeople} type="button">Pessoas ({people.length})</button><button className="button button-secondary card-add-button" onClick={onAddCard} type="button">＋ Novo cartão</button></div>
      </div>
      {cards.length === 0 ? (
        <div className="empty-state card-empty"><span className="empty-icon" aria-hidden="true">▣</span><strong>Nenhum cartão cadastrado</strong><p>Cadastre um cartão para acompanhar compras e parcelas nas próximas faturas.</p></div>
      ) : (
        <div className="card-forecast-grid">{cards.map((card) => {
          const cardInvoices = invoices.filter((invoice) => invoice.cardId === card.id)
          return <article className="credit-card-item" key={card.id}>
            <div className="credit-card-heading"><span className="credit-card-icon" aria-hidden="true">▣</span><div><strong>{card.name}</strong><small>Fecha dia {card.closingDay} · vence dia {card.dueDay}</small></div></div>
            {cardInvoices.length === 0 ? <p className="no-invoices">Sem compras previstas nas próximas faturas.</p> : <ul className="invoice-list">
              {cardInvoices.slice(0, 5).map((invoice) => <li className="invoice-row" key={invoice.id}>
                <span><strong>Vence {dateLabel(invoice.dueDate)}</strong><small>{invoice.installments.length} {invoice.installments.length === 1 ? 'parcela' : 'parcelas'}</small>{invoice.personTotals.length > 0 ? <small className="invoice-person-totals">{invoice.personTotals.map((person) => `${person.personName}: ${person.amount.format()}`).join(' · ')}</small> : <small className="invoice-person-totals">Divisão não informada</small>}</span>
                <strong className="invoice-total">{invoice.total.format()}</strong>
              </li>)}
            </ul>}
            <button className="add-account-link" disabled={people.length === 0} onClick={() => onAddPurchase(card.id)} title={people.length === 0 ? 'Cadastre pessoas antes de registrar compras' : undefined} type="button">＋ Registrar compra</button>
          </article>
        })}</div>
      )}
    </section>
  )
}

export default CardForecastPanel


