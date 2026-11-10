export type PersonProps = { id: string; name: string; createdAt: string }

export class Person {
  readonly id: string
  readonly name: string
  readonly createdAt: string

  private constructor(props: PersonProps) {
    const name = props.name.trim()
    if (!name) throw new Error('Informe o nome da pessoa.')
    this.id = props.id
    this.name = name
    this.createdAt = props.createdAt
  }

  static create(name: string): Person {
    return new Person({ id: crypto.randomUUID(), name, createdAt: new Date().toISOString() })
  }

  static restore(props: PersonProps): Person {
    return new Person(props)
  }
}
