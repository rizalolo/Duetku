import type { Category, Transaction, TransactionType } from '../types'
import { monthRange } from './period'

export interface CategoryTotal {
  categoryId: string
  name: string
  icon: string
  color: string
  total: number
  count: number
  percentage: number // 0-100 dari total tipe tsb
}

export function filterByMonth(transactions: Transaction[], key: string): Transaction[] {
  const [start, end] = monthRange(key)
  return transactions.filter((t) => t.date >= start && t.date < end)
}

export function sumByType(transactions: Transaction[], type: TransactionType): number {
  return transactions.filter((t) => t.type === type).reduce((s, t) => s + t.amount, 0)
}

export function totalsByCategory(
  transactions: Transaction[],
  categoryMap: Map<string, Category>,
  type: TransactionType
): CategoryTotal[] {
  const rows = new Map<string, CategoryTotal>()
  let grand = 0
  for (const t of transactions) {
    if (t.type !== type) continue
    grand += t.amount
    const cat = categoryMap.get(t.categoryId)
    const row = rows.get(t.categoryId) ?? {
      categoryId: t.categoryId,
      name: cat?.name ?? 'Tanpa kategori',
      icon: cat?.icon ?? '❔',
      color: cat?.color ?? '#8b90a0',
      total: 0,
      count: 0,
      percentage: 0,
    }
    row.total += t.amount
    row.count += 1
    rows.set(t.categoryId, row)
  }
  return Array.from(rows.values())
    .map((r) => ({ ...r, percentage: grand > 0 ? (r.total / grand) * 100 : 0 }))
    .sort((a, b) => b.total - a.total)
}

/** Pengeluaran dipecah kebutuhan / keinginan / belum dikelompokkan (kategori terhapus). */
export function needsWantsSplit(transactions: Transaction[], categoryMap: Map<string, Category>) {
  let needs = 0
  let wants = 0
  let other = 0
  for (const t of transactions) {
    if (t.type !== 'expense') continue
    const group = categoryMap.get(t.categoryId)?.group
    if (group === 'needs') needs += t.amount
    else if (group === 'wants') wants += t.amount
    else other += t.amount
  }
  return { needs, wants, other, total: needs + wants + other }
}

/** Persentase perubahan; null kalau pembanding 0 (tidak bisa dihitung). */
export function percentChange(current: number, previous: number): number | null {
  if (previous === 0) return null
  return ((current - previous) / previous) * 100
}
