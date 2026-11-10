import { Person } from '../../domain/people/Person'
import type { PersonRepository } from '../../domain/people/PersonRepository'

export class CreatePerson {
  constructor(private readonly people: PersonRepository) {}

  async execute(name: string): Promise<Person> {
    const person = Person.create(name)
    await this.people.savePerson(person)
    return person
  }
}
