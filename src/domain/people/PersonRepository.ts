import type { Person } from './Person'

export interface PersonRepository {
  getAllPeople(): Promise<Person[]>
  getPersonById(id: string): Promise<Person | undefined>
  savePerson(person: Person): Promise<void>
}
