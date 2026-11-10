import type { CardPurchase } from '../../domain/cards/CardPurchase'
import type { CreditCard } from '../../domain/cards/CreditCard'
import type { Person } from '../../domain/people/Person'
import { Money } from '../../domain/money/Money'

export type ScheduledPersonAmount = { personId: string; personName: string; amount: Money }
export type ScheduledInstallment = { purchaseId: string; description: string; categoryId: string; number: number; count: number; amount: Money; allocations: ScheduledPersonAmount[] }
export type InvoicePersonTotal = { personId: string; personName: string; amount: Money }
export type InvoiceForecast = { id: string; cardId: string; cardName: string; closingDate: string; dueDate: string; total: Money; installments: ScheduledInstallment[]; personTotals: InvoicePersonTotal[] }
type FlowEdge = { to: number; reverseIndex: number; capacity: number }

function addMonths(year: number, monthIndex: number, amount: number): { year: number; monthIndex: number } {
  const date = new Date(Date.UTC(year, monthIndex + amount, 1))
  return { year: date.getUTCFullYear(), monthIndex: date.getUTCMonth() }
}

function isoDate(year: number, monthIndex: number, day: number): string {
  const lastDay = new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate()
  return `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(Math.min(day, lastDay)).padStart(2, '0')}`
}

function monthFromDate(date: string): { year: number; monthIndex: number; day: number } {
  const [year, month, day] = date.split('-').map(Number)
  return { year, monthIndex: month - 1, day }
}

function distributeInstallmentCents(totalCents: number, shares: number[], count: number): number[][] {
  const installmentTotals = Array.from({ length: count }, (_, index) => Math.floor(totalCents / count) + (index < totalCents % count ? 1 : 0))
  if (shares.length === 0) return installmentTotals.map(() => [])
  const denominator = BigInt(totalCents)
  const shareValues = shares.map(BigInt)
  const matrix = installmentTotals.map((rowTotal) => shares.map((share) => Number((BigInt(rowTotal) * BigInt(share)) / denominator)))
  const rowNeeds = installmentTotals.map((rowTotal, row) => rowTotal - matrix[row].reduce((sum, value) => sum + value, 0))
  const columnNeeds = shares.map((share, column) => share - matrix.reduce((sum, row) => sum + row[column], 0))

  const source = 0
  const rowStart = 1
  const columnStart = rowStart + count
  const sink = columnStart + shares.length
  const graph: FlowEdge[][] = Array.from({ length: sink + 1 }, () => [])
  const cellEdges: Array<Array<FlowEdge | undefined>> = Array.from({ length: count }, () => Array(shares.length))
  const addEdge = (from: number, to: number, capacity: number): FlowEdge => {
    const forward: FlowEdge = { to, reverseIndex: graph[to].length, capacity }
    const reverse: FlowEdge = { to: from, reverseIndex: graph[from].length, capacity: 0 }
    graph[from].push(forward)
    graph[to].push(reverse)
    return forward
  }

  rowNeeds.forEach((need, row) => addEdge(source, rowStart + row, need))
  columnNeeds.forEach((need, column) => addEdge(columnStart + column, sink, need))
  for (let row = 0; row < count; row += 1) {
    for (let column = 0; column < shares.length; column += 1) {
      if ((BigInt(installmentTotals[row]) * shareValues[column]) % denominator !== 0n) {
        cellEdges[row][column] = addEdge(rowStart + row, columnStart + column, 1)
      }
    }
  }

  let flow = 0
  const target = rowNeeds.reduce((sum, value) => sum + value, 0)
  while (flow < target) {
    const parentNode = Array(graph.length).fill(-1) as number[]
    const parentEdge = Array(graph.length).fill(-1) as number[]
    const queue = [source]
    parentNode[source] = source
    for (let cursor = 0; cursor < queue.length && parentNode[sink] === -1; cursor += 1) {
      const node = queue[cursor]
      graph[node].forEach((edge, index) => {
        if (edge.capacity > 0 && parentNode[edge.to] === -1) {
          parentNode[edge.to] = node
          parentEdge[edge.to] = index
          queue.push(edge.to)
        }
      })
    }
    if (parentNode[sink] === -1) throw new Error('Não foi possível distribuir os centavos entre as pessoas.')
    for (let node = sink; node !== source; node = parentNode[node]) {
      const previous = parentNode[node]
      const edge = graph[previous][parentEdge[node]]
      edge.capacity -= 1
      graph[node][edge.reverseIndex].capacity += 1
    }
    flow += 1
  }

  return matrix.map((row, rowIndex) => row.map((base, columnIndex) => {
    const edge = cellEdges[rowIndex][columnIndex]
    return base + (edge ? graph[edge.to][edge.reverseIndex].capacity : 0)
  }))
}

export function buildInvoiceForecast(cards: CreditCard[], purchases: CardPurchase[], people: Person[] = []): InvoiceForecast[] {
  const cardsById = new Map(cards.map((card) => [card.id, card]))
  const peopleById = new Map(people.map((person) => [person.id, person.name]))
  const invoices = new Map<string, InvoiceForecast>()

  for (const purchase of purchases) {
    const card = cardsById.get(purchase.cardId)
    if (!card) continue
    const purchaseDate = monthFromDate(purchase.date)
    const firstCycle = addMonths(purchaseDate.year, purchaseDate.monthIndex, purchaseDate.day <= card.closingDay ? 0 : 1)
    const shares = purchase.allocations.map((allocation) => allocation.amount.cents)
    const installmentAllocations = distributeInstallmentCents(purchase.amount.cents, shares, purchase.installments)

    for (let index = 0; index < purchase.installments; index += 1) {
      const cycle = addMonths(firstCycle.year, firstCycle.monthIndex, index)
      const closingDate = isoDate(cycle.year, cycle.monthIndex, card.closingDay)
      const dueCycle = card.dueDay > card.closingDay ? cycle : addMonths(cycle.year, cycle.monthIndex, 1)
      const dueDate = isoDate(dueCycle.year, dueCycle.monthIndex, card.dueDay)
      const id = `${card.id}:${closingDate}`
      const installmentAmount = Math.floor(purchase.amount.cents / purchase.installments) + (index < purchase.amount.cents % purchase.installments ? 1 : 0)
      const allocations = purchase.allocations.map((allocation, personIndex) => ({
        personId: allocation.personId,
        personName: peopleById.get(allocation.personId) ?? 'Pessoa sem cadastro',
        amount: Money.fromCents(installmentAllocations[index][personIndex]),
      }))
      const installment: ScheduledInstallment = { purchaseId: purchase.id, description: purchase.description, categoryId: purchase.categoryId, number: index + 1, count: purchase.installments, amount: Money.fromCents(installmentAmount), allocations }
      const invoice = invoices.get(id) ?? { id, cardId: card.id, cardName: card.name, closingDate, dueDate, total: Money.zero(), installments: [], personTotals: [] }
      invoice.installments.push(installment)
      invoice.total = invoice.total.plus(installment.amount)
      for (const allocation of allocations) {
        const existing = invoice.personTotals.find((item) => item.personId === allocation.personId)
        if (existing) existing.amount = existing.amount.plus(allocation.amount)
        else invoice.personTotals.push({ personId: allocation.personId, personName: allocation.personName, amount: allocation.amount })
      }
      invoices.set(id, invoice)
    }
  }
  return [...invoices.values()].sort((a, b) => a.dueDate.localeCompare(b.dueDate) || a.cardName.localeCompare(b.cardName))
}
