import { useMemo } from 'react'
import { useUserCollection, useFirestoreActions } from '../../lib/firestore'
import { useTransactions } from '../transactions/useTransactions'
import { daysInMonth, dayOfMonth, monthKey } from '../../lib/format'
import { filterByMonth } from '../../lib/stats'
import type { Budget, BudgetProgress } from '../../types'

export const WARN_THRESHOLD = 80 // persen: mulai tampil peringatan

export type BudgetStatus = 'ok' | 'warning' | 'over'

export function budgetStatus(percentage: number): BudgetStatus {
  if (percentage >= 100) return 'over'
  if (percentage >= WARN_THRESHOLD) return 'warning'
  return 'ok'
}

/** Anggaran bersifat berulang tiap bulan; progres dihitung untuk bulan yang diminta. */
export function useBudgets(month: string = monthKey()) {
  const { data, loading: loadingBudgets, error } = useUserCollection<Budget>('budgets')
  const { transactions, loading: loadingTx } = useTransactions()
  const { add, update, remove } = useFirestoreActions('budgets')

  const budgets: BudgetProgress[] = useMemo(() => {
    const monthTx = filterByMonth(transactions, month).filter((t) => t.type === 'expense')
    const days = daysInMonth(month)
    return data.map((b) => {
      const ids = new Set(b.categoryIds)
      const spent = monthTx.filter((t) => ids.has(t.categoryId)).reduce((s, t) => s + t.amount, 0)
      return {
        ...b,
        spent,
        percentage: b.limitAmount > 0 ? (spent / b.limitAmount) * 100 : 0,
        remaining: b.limitAmount - spent,
        dailyPace: b.limitAmount / days,
      }
    })
  }, [data, transactions, month])

  const daysLeft = daysInMonth(month) - dayOfMonth(month)

  return {
    budgets,
    daysLeft,
    loading: loadingBudgets || loadingTx,
    error,
    addBudget: (p: Omit<Budget, 'id' | 'createdAt'>) => add({ ...p, createdAt: Date.now() }),
    updateBudget: (id: string, p: Partial<Omit<Budget, 'id'>>) => update(id, p),
    deleteBudget: (id: string) => remove(id),
  }
}
