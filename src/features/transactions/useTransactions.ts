import { useUserCollection, useFirestoreActions } from '../../lib/firestore'
import type { Transaction } from '../../types'

export function useTransactions() {
  const { data, loading, error } = useUserCollection<Transaction>('transactions')
  const { add, update, remove } = useFirestoreActions('transactions')

  function addTransaction(payload: Omit<Transaction, 'id' | 'createdAt'>) {
    return add({ ...payload, createdAt: Date.now() })
  }

  function updateTransaction(id: string, payload: Partial<Omit<Transaction, 'id'>>) {
    return update(id, payload)
  }

  function deleteTransaction(id: string) {
    return remove(id)
  }

  return { transactions: data, loading, error, addTransaction, updateTransaction, deleteTransaction }
}
