import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, ArrowDown, ArrowUp } from 'lucide-react'
import { useTransactions } from '../transactions/useTransactions'
import { useCategories } from '../categories/useCategories'
import { DonutChart } from '../../components/charts/DonutChart'
import { MonthlyBars } from '../../components/charts/MonthlyBars'
import { CategoryBreakdown } from './CategoryBreakdown'
import { formatRupiah, formatRupiahCompact, monthKey } from '../../lib/format'
import { monthLabel, monthShortLabel, shiftMonth } from '../../lib/period'
import {
  filterByMonth,
  needsWantsSplit,
  percentChange,
  sumByType,
  totalsByCategory,
} from '../../lib/stats'

type Tab = 'summary' | 'compare'

export function AnalyticsPage() {
  const { transactions, loading } = useTransactions()
  const { categories } = useCategories()
  const [month, setMonth] = useState(monthKey())
  const [tab, setTab] = useState<Tab>('summary')

  const categoryMap = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories])
  const monthTx = useMemo(() => filterByMonth(transactions, month), [transactions, month])
  const prevKey = shiftMonth(month, -1)
  const prevTx = useMemo(() => filterByMonth(transactions, prevKey), [transactions, prevKey])

  const income = sumByType(monthTx, 'income')
  const expense = sumByType(monthTx, 'expense')
  const net = income - expense

  const expenseRows = useMemo(() => totalsByCategory(monthTx, categoryMap, 'expense'), [monthTx, categoryMap])
  const incomeRows = useMemo(() => totalsByCategory(monthTx, categoryMap, 'income'), [monthTx, categoryMap])
  const split = useMemo(() => needsWantsSplit(monthTx, categoryMap), [monthTx, categoryMap])

  const bars = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => shiftMonth(month, i - 5)).map((k) => {
      const tx = filterByMonth(transactions, k)
      return {
        key: k,
        label: monthShortLabel(k),
        income: sumByType(tx, 'income'),
        expense: sumByType(tx, 'expense'),
        highlight: k === month,
      }
    })
  }, [transactions, month])

  const compareRows = useMemo(() => {
    const cur = totalsByCategory(monthTx, categoryMap, 'expense')
    const prev = new Map(totalsByCategory(prevTx, categoryMap, 'expense').map((r) => [r.categoryId, r.total]))
    const ids = new Set([...cur.map((r) => r.categoryId), ...prev.keys()])
    return Array.from(ids)
      .map((id) => {
        const c = categoryMap.get(id)
        const now = cur.find((r) => r.categoryId === id)?.total ?? 0
        const before = prev.get(id) ?? 0
        return { id, name: c?.name ?? 'Tanpa kategori', icon: c?.icon ?? '❔', now, before, change: percentChange(now, before) }
      })
      .sort((a, b) => b.now + b.before - (a.now + a.before))
  }, [monthTx, prevTx, categoryMap])

  const prevExpense = sumByType(prevTx, 'expense')
  const expenseChange = percentChange(expense, prevExpense)

  return (
    <div className="px-5 pt-6 pb-6">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-semibold">Ikhtisar</h1>
        <div className="flex items-center gap-1">
          <button onClick={() => setMonth(shiftMonth(month, -1))} className="p-2 text-text-muted">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm min-w-28 text-center">{monthLabel(month)}</span>
          <button
            onClick={() => setMonth(shiftMonth(month, 1))}
            disabled={month >= monthKey()}
            className="p-2 text-text-muted disabled:opacity-30"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex bg-surface-raised border border-border rounded-xl p-1 mb-5">
        {(['summary', 'compare'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium ${tab === t ? 'bg-surface text-text border border-border' : 'text-text-muted'}`}
          >
            {t === 'summary' ? 'Ringkasan' : 'Bandingkan'}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-text-muted text-sm text-center py-10">Memuat...</p>
      ) : tab === 'summary' ? (
        <div className="flex flex-col gap-4">
          <div className="bg-surface border border-border rounded-2xl p-5">
            <p className="text-sm text-text-muted mb-1">Arus kas bersih</p>
            <p className={`text-2xl font-semibold tabular-nums mb-4 ${net >= 0 ? 'text-income' : 'text-expense'}`}>
              {net >= 0 ? '+' : ''}
              {formatRupiah(net)}
            </p>
            <div className="flex items-center gap-5">
              <DonutChart
                segments={[
                  { value: income, color: 'var(--color-income)', label: 'Pemasukan' },
                  { value: expense, color: 'var(--color-expense)', label: 'Pengeluaran' },
                ]}
                center={
                  <>
                    <span className="text-xs text-text-muted">Masuk</span>
                    <span className="text-sm font-semibold tabular-nums">{formatRupiahCompact(income)}</span>
                  </>
                }
              />
              <div className="flex flex-col gap-3 text-sm min-w-0">
                <Legend color="bg-income" label="Pemasukan" value={income} pct={income + expense > 0 ? (income / (income + expense)) * 100 : 0} />
                <Legend color="bg-expense" label="Pengeluaran" value={expense} pct={income + expense > 0 ? (expense / (income + expense)) * 100 : 0} />
              </div>
            </div>
          </div>

          <div className="bg-surface border border-border rounded-2xl p-5">
            <h2 className="font-semibold mb-4">Kebutuhan vs keinginan</h2>
            {split.total === 0 ? (
              <p className="text-sm text-text-muted">Belum ada pengeluaran bulan ini.</p>
            ) : (
              <div className="flex items-center gap-5">
                <DonutChart
                  segments={[
                    { value: split.needs, color: 'var(--color-needs)', label: 'Kebutuhan' },
                    { value: split.wants, color: 'var(--color-wants)', label: 'Keinginan' },
                    { value: split.other, color: 'var(--color-text-faint)', label: 'Lainnya' },
                  ]}
                  center={
                    <>
                      <span className="text-xs text-text-muted">Kebutuhan</span>
                      <span className="text-lg font-semibold tabular-nums">
                        {((split.needs / split.total) * 100).toFixed(1)}%
                      </span>
                    </>
                  }
                />
                <div className="flex flex-col gap-3 text-sm min-w-0">
                  <Legend color="bg-needs" label="Kebutuhan" value={split.needs} pct={(split.needs / split.total) * 100} />
                  <Legend color="bg-wants" label="Keinginan" value={split.wants} pct={(split.wants / split.total) * 100} />
                  {split.other > 0 && (
                    <Legend color="bg-text-faint" label="Tanpa kelompok" value={split.other} pct={(split.other / split.total) * 100} />
                  )}
                </div>
              </div>
            )}
          </div>

          <CategoryBreakdown title="Pengeluaran teratas" rows={expenseRows} emptyText="Belum ada pengeluaran bulan ini." />
          <CategoryBreakdown title="Sumber pemasukan" rows={incomeRows} emptyText="Belum ada pemasukan bulan ini." />
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="bg-surface border border-border rounded-2xl p-5">
            <p className="text-sm text-text-muted mb-1">Pengeluaran {monthLabel(month)}</p>
            <p className="text-2xl font-semibold tabular-nums mb-1">{formatRupiah(expense)}</p>
            <p className="text-sm text-text-muted">
              {expenseChange === null ? (
                'Tidak ada data bulan sebelumnya untuk dibandingkan'
              ) : (
                <span className={`inline-flex items-center gap-1 ${expenseChange <= 0 ? 'text-income' : 'text-expense'}`}>
                  {expenseChange <= 0 ? <ArrowDown className="w-3.5 h-3.5" /> : <ArrowUp className="w-3.5 h-3.5" />}
                  {Math.abs(expenseChange).toFixed(1)}% vs {monthLabel(prevKey)}
                </span>
              )}
            </p>
          </div>

          <div className="bg-surface border border-border rounded-2xl p-5">
            <h2 className="font-semibold mb-4">6 bulan terakhir</h2>
            <MonthlyBars data={bars} />
            <div className="flex gap-4 text-xs text-text-muted mt-4">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-income" />Pemasukan</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-expense" />Pengeluaran</span>
            </div>
          </div>

          <div className="bg-surface border border-border rounded-2xl p-5">
            <h2 className="font-semibold mb-4">Per kategori</h2>
            {compareRows.length === 0 ? (
              <p className="text-sm text-text-muted">Belum ada pengeluaran di dua bulan ini.</p>
            ) : (
              <div className="flex flex-col gap-4">
                {compareRows.map((r) => (
                  <div key={r.id} className="flex items-center gap-3">
                    <span className="text-lg">{r.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{r.name}</p>
                      <p className="text-xs text-text-muted tabular-nums">
                        {formatRupiahCompact(r.before)} → {formatRupiahCompact(r.now)}
                      </p>
                    </div>
                    <span
                      className={`text-xs tabular-nums ${
                        r.change === null ? 'text-text-muted' : r.change <= 0 ? 'text-income' : 'text-expense'
                      }`}
                    >
                      {r.change === null ? (r.now > 0 ? 'baru' : '-') : `${r.change > 0 ? '+' : ''}${r.change.toFixed(0)}%`}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function Legend({ color, label, value, pct }: { color: string; label: string; value: number; pct: number }) {
  return (
    <div className="flex items-center gap-2 min-w-0">
      <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${color}`} />
      <div className="min-w-0">
        <p className="text-text-muted text-xs">{label}</p>
        <p className="tabular-nums text-sm">
          {formatRupiahCompact(value)} <span className="text-text-muted text-xs">{pct.toFixed(1)}%</span>
        </p>
      </div>
    </div>
  )
}
