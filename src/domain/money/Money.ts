export class Money {
  private constructor(readonly cents: number) {
    if (!Number.isSafeInteger(cents)) {
      throw new Error('O valor monetário excede a precisão suportada.')
    }
  }

  static zero(): Money {
    return new Money(0)
  }

  static fromCents(cents: number): Money {
    return new Money(cents)
  }

  static fromInput(input: string, allowZero = false): Money {
    const normalized = input.trim().replace(',', '.')
    if (!/^\d+(?:\.\d{1,2})?$/.test(normalized)) {
      throw new Error('Informe um valor com até duas casas decimais.')
    }

    const [wholePart, fractionPart = ''] = normalized.split('.')
    const cents = Number(wholePart) * 100 + Number(fractionPart.padEnd(2, '0'))
    if (!Number.isSafeInteger(cents) || (!allowZero && cents <= 0)) {
      throw new Error(allowZero ? 'Informe um valor válido.' : 'O valor precisa ser maior que zero.')
    }

    return new Money(cents)
  }

  plus(other: Money): Money {
    return new Money(this.cents + other.cents)
  }

  minus(other: Money): Money {
    return new Money(this.cents - other.cents)
  }

  format(): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(this.cents / 100)
  }
}
