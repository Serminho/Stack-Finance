import { describe, expect, it } from 'vitest'
import { Money } from '../../src/domain/money/Money'

describe('Money', () => {
  it('converte valores com vírgula para centavos inteiros', () => {
    expect(Money.fromInput('1234,56').cents).toBe(123456)
  })

  it('permite zero quando usado como saldo inicial', () => {
    expect(Money.fromInput('0', true).cents).toBe(0)
  })

  it('rejeita mais de duas casas decimais', () => {
    expect(() => Money.fromInput('12,345')).toThrow('até duas casas decimais')
  })

  it('rejeita valores negativos e zero em movimentações', () => {
    expect(() => Money.fromInput('-2,00')).toThrow('até duas casas decimais')
    expect(() => Money.fromInput('0')).toThrow('maior que zero')
  })
})
