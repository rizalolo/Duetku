import { useMemo } from 'react'
import { useTransactions } from '../transactions/useTransactions'
import { useCategories } from '../categories/useCategories'
import { monthKey } from '../../lib/format'

export interface CategoryBreakdownItem {
  categoryId: string
  name: string
  icon: string
  color: string
  total: number
  percentage: number
  count: number
}

export interface MonthTotal {
  month: string // 'YYYY-MM'
  label: string // 'Jan', 'Feb', dst
  income: number
  expense: number
}

export function useAnalytics(selectedMonth: string = monthKey()) {
  const { transactions, loading: loadingTx } = useTransactions()
  const { categories, loading: loadingCat } = useCategories()

  const categoryMap = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories])

  const monthTx = useMemo(
    () => transactions.filter((t) => monthKey(new Date(t.date)) === selectedMonth),
    [transactions, selectedMonth]
  )

  function breakdownByType(type: 'income' | 'expense'): CategoryBreakdownItem[] {
    const filtered = monthTx.filter((t) => t.type === type)
    const total = filtered.reduce((s, t) => s + t.amount, 0)
    const byCategory = new Map<string, { total: number; count: number }>()
    filtered.forEach((t) => {
      const prev = byCategory.get(t.categoryId) ?? { total: 0, count: 0 }
      byCategory.set(t.categoryId, { total: prev.total + t.amount, count: prev.count + 1 })
    })
    return Array.from(byCategory.entries())
      .map(([categoryId, v]) => {
        const cat = categoryMap.get(categoryId)
        return {
          categoryId,
          name: cat?.name ?? 'Tanpa kategori',
          icon: cat?.icon ?? '❔',
          color: cat?.color ?? '#8b90a0',
          total: v.total,
          count: v.count,
          percentage: total > 0 ? (v.total / total) * 100 : 0,
        }
      })
      .sort((a, b) => b.total - a.total)
  }

  const expenseBreakdown = useMemo(() => breakdownByType('expense'), [monthTx, categoryMap])
  const incomeBreakdown = useMemo(() => breakdownByType('income'), [monthTx, categoryMap])

  const needsWants = useMemo(() => {
    let needs = 0
    let wants = 0
    monthTx
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        const cat = categoryMap.get(t.categoryId)
        if (cat?.group === 'needs') needs += t.amount
        else if (cat?.group === 'wants') wants += t.amount
      })
    const total = needs + wants
    return {
      needs,
      wants,
      needsPct: total > 0 ? (needs / total) * 100 : 0,
      wantsPct: total > 0 ? (wants / total) * 100 : 0,
    }
  }, [monthTx, categoryMap])

  const totalIncome = incomeBreakdown.reduce((s, c) => s + c.total, 0)
  const totalExpense = expenseBreakdown.reduce((s, c) => s + c.total, 0)

  // 6 bulan terakhir termasuk bulan terpilih, untuk grafik compare
  const monthlyCompare: MonthTotal[] = useMemo(() => {
    const [y, m] = selectedMonth.split('-').map(Number)
    const months: MonthTotal[] = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date(y, m - 1 - i, 1)
      const key = monthKey(d)
      const income = transactions
        .filter((t) => t.type === 'income' && monthKey(new Date(t.date)) === key)
        .reduce((s, t) => s + t.amount, 0)
      const expense = transactions
        .filter((t) => t.type === 'expense' && monthKey(new Date(t.date)) === key)
        .reduce((s, t) => s + t.amount, 0)
      months.push({
        month: key,
        label: d.toLocaleDateString('id-ID', { month: 'short' }),
        income,
        expense,
      })
    }
    return months
  }, [transactions, selectedMonth])

  return {
    loading: loadingTx || loadingCat,
    expenseBreakdown,
    incomeBreakdown,
    needsWants,
    totalIncome,
    totalExpense,
    monthlyCompare,
  }
}
