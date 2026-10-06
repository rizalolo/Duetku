import { useMemo, useState } from 'react'
import { Plus, Receipt, ChevronLeft, ChevronRight } from 'lucide-react'
import { useTransactions } from './useTransactions'
import { useWallets } from '../wallets/useWallets'
import { useCategories } from '../categories/useCategories'
import { TransactionFormSheet } from './TransactionFormSheet'
import { BudgetAlerts } from '../budgets/BudgetAlerts'
import { EmptyState } from '../../components/ui/EmptyState'
import { formatRupiah, formatDate, monthKey } from '../../lib/format'
import { monthLabel, shiftMonth, weekLabel, weekRange, monthRange as monthRangeOf } from '../../lib/period'
import type { Transaction } from '../../types'

type Period = 'week' | 'month'

export function HomePage() {
  const { transactions, loading, addTransaction, updateTransaction, deleteTransaction } = useTransactions()
  const { wallets } = useWallets()
  const { categories } = useCategories()
  const [period, setPeriod] = useState<Period>('month')
  const [offset, setOffset] = useState(0)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editingTx, setEditingTx] = useState<Transaction | null>(null)

  function switchPeriod(p: Period) {
    setPeriod(p)
    setOffset(0)
  }

  const categoryMap = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories])

  const [rangeStart, rangeEnd] = useMemo(
    () => (period === 'week' ? weekRange(offset) : monthRangeOf(shiftMonth(monthKey(), offset))),
    [period, offset]
  )
  const periodLabel = period === 'week' ? weekLabel(offset) : monthLabel(shiftMonth(monthKey(), offset))

  const periodTx = useMemo(
    () => transactions.filter((t) => t.date >= rangeStart && t.date < rangeEnd).sort((a, b) => b.date - a.date),
    [transactions, rangeStart, rangeEnd]
  )

  const totalIncome = periodTx.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const totalExpense = periodTx.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0)

  const grouped = useMemo(() => {
    const map = new Map<string, Transaction[]>()
    periodTx.forEach((t) => {
      const key = formatDate(t.date)
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(t)
    })
    return Array.from(map.entries())
  }, [periodTx])

  function openAdd() {
    setEditingTx(null)
    setSheetOpen(true)
  }
  function openEdit(t: Transaction) {
    setEditingTx(t)
    setSheetOpen(true)
  }

  return (
    <div className="px-5 pt-6">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-xl font-semibold">Beranda</h1>
        <div className="flex bg-surface-raised border border-border rounded-full p-1 text-sm">
          {(['week', 'month'] as const).map((p) => (
            <button
              key={p}
              onClick={() => switchPeriod(p)}
              className={`px-3 py-1 rounded-full ${period === p ? 'bg-brand text-bg font-medium' : 'text-text-muted'}`}
            >
              {p === 'week' ? 'Minggu' : 'Bulan'}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-center gap-1 mb-5">
        <button onClick={() => setOffset((o) => o - 1)} className="p-2 text-text-muted">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-sm text-text-muted min-w-40 text-center">{periodLabel}</span>
        <button onClick={() => setOffset((o) => o + 1)} disabled={offset >= 0} className="p-2 text-text-muted disabled:opacity-30">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <BudgetAlerts />

      <div className="bg-surface border border-border rounded-2xl p-5 mb-6">
        <p className="text-text-muted text-sm mb-1">Arus Kas Bersih</p>
        <p
          className={`text-2xl font-semibold tabular-nums mb-4 ${
            totalIncome - totalExpense >= 0 ? 'text-income' : 'text-expense'
          }`}
        >
          {formatRupiah(totalIncome - totalExpense)}
        </p>
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-income" />
            <span className="text-text-muted">Masuk</span>
            <span className="tabular-nums">{formatRupiah(totalIncome)}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-expense" />
            <span className="text-text-muted">Keluar</span>
            <span className="tabular-nums">{formatRupiah(totalExpense)}</span>
          </div>
        </div>
      </div>

      {loading ? (
        <p className="text-text-muted text-sm text-center py-10">Memuat...</p>
      ) : wallets.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="Buat dompet dulu"
          description="Sebelum mencatat transaksi, buat dompet di tab Akun terlebih dahulu."
        />
      ) : grouped.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="Belum ada transaksi"
          description={`Tidak ada transaksi pada periode ${period === 'week' ? 'minggu' : 'bulan'} ini.`}
        />
      ) : (
        <div className="flex flex-col gap-5 pb-6">
          {grouped.map(([date, items]) => (
            <div key={date}>
              <p className="text-sm text-text-muted mb-2">{date}</p>
              <div className="flex flex-col gap-2">
                {items.map((t) => {
                  const cat = categoryMap.get(t.categoryId)
                  return (
                    <button
                      key={t.id}
                      onClick={() => openEdit(t)}
                      className="w-full flex items-center gap-3 bg-surface border border-border rounded-xl p-3 text-left"
                    >
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center text-base shrink-0"
                        style={{ backgroundColor: (cat?.color ?? '#8b90a0') + '33' }}
                      >
                        {cat?.icon ?? '❔'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{cat?.name ?? 'Tanpa kategori'}</p>
                        {t.description && (
                          <p className="text-xs text-text-muted truncate">{t.description}</p>
                        )}
                      </div>
                      <p
                        className={`text-sm font-medium tabular-nums shrink-0 ${
                          t.type === 'income' ? 'text-income' : 'text-expense'
                        }`}
                      >
                        {t.type === 'income' ? '+' : '-'}
                        {formatRupiah(t.amount)}
                      </p>
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={openAdd}
        disabled={wallets.length === 0}
        className="fixed bottom-24 right-5 w-14 h-14 rounded-full bg-brand text-bg flex items-center justify-center shadow-lg disabled:opacity-40"
      >
        <Plus className="w-6 h-6" />
      </button>

      {sheetOpen && (
        <TransactionFormSheet
          open
          onClose={() => setSheetOpen(false)}
          initial={editingTx ?? undefined}
          onSubmit={async (payload) => {
            if (editingTx) await updateTransaction(editingTx.id, payload)
            else await addTransaction(payload)
          }}
          onDelete={editingTx ? () => deleteTransaction(editingTx.id) : undefined}
        />
      )}
    </div>
  )
}
