import type { TransactionRepository } from '../../domain/transactions/TransactionRepository'

export class DeleteTransaction {
  constructor(private readonly transactions: TransactionRepository) {}

  async execute(id: string): Promise<void> {
    await this.transactions.deleteTransactionById(id)
  }
}

