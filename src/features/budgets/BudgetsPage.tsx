import { useState } from 'react'
import { Plus, BarChart3, Pencil, Trash2 } from 'lucide-react'
import { budgetStatus, useBudgets } from './useBudgets'
import { BudgetFormSheet } from './BudgetFormSheet'
import { Button } from '../../components/ui/Button'
import { EmptyState } from '../../components/ui/EmptyState'
import { useCategories } from '../categories/useCategories'
import { dayOfMonth, formatRupiah, monthKey } from '../../lib/format'
import type { BudgetProgress } from '../../types'

const barColor = { ok: 'bg-income', warning: 'bg-brand', over: 'bg-expense' }

export function BudgetsPage({ embedded = false }: { embedded?: boolean }) {
  const month = monthKey()
  const { budgets, daysLeft, loading, addBudget, updateBudget, deleteBudget } = useBudgets(month)
  const { categories } = useCategories()
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editing, setEditing] = useState<BudgetProgress | null>(null)

  const catMap = new Map(categories.map((c) => [c.id, c]))

  function openCreate() {
    setEditing(null)
    setSheetOpen(true)
  }
  function openEdit(b: BudgetProgress) {
    setEditing(b)
    setSheetOpen(true)
  }
  async function handleDelete(id: string) {
    if (confirm('Hapus anggaran ini? Transaksi tidak ikut terhapus.')) await deleteBudget(id)
  }

  return (
    <div className={embedded ? '' : 'px-5 pt-6'}>
      {!embedded && (
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-xl font-semibold">Anggaran</h1>
          <button onClick={openCreate} className="w-9 h-9 rounded-full bg-brand text-bg flex items-center justify-center">
            <Plus className="w-5 h-5" />
          </button>
        </div>
      )}
      <p className="text-sm text-text-muted mb-6">Bulan ini · sisa {daysLeft} hari</p>
      {embedded && (
        <button
          onClick={openCreate}
          className="w-full flex items-center justify-center gap-2 bg-surface-raised border border-border rounded-xl py-3 text-sm font-medium mb-6 -mt-3"
        >
          <Plus className="w-4 h-4" /> Buat Anggaran
        </button>
      )}

      {loading ? (
        <p className="text-text-muted text-sm text-center py-10">Memuat...</p>
      ) : budgets.length === 0 ? (
        <EmptyState
          icon={BarChart3}
          title="Belum ada anggaran"
          description="Buat anggaran, pilih kategori yang masuk, dan tentukan limit bulanannya."
          action={<Button onClick={openCreate}>Buat Anggaran</Button>}
        />
      ) : (
        <div className="flex flex-col gap-4">
          {budgets.map((b) => {
            const status = budgetStatus(b.percentage)
            const expectedSoFar = b.dailyPace * dayOfMonth(month)
            const aheadOfPace = b.spent > expectedSoFar
            return (
              <div key={b.id} className="bg-surface border border-border rounded-2xl p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="min-w-0">
                    <p className="font-semibold truncate">{b.name}</p>
                    <p className="text-xs text-text-muted truncate">
                      {b.categoryIds.map((id) => catMap.get(id)?.name).filter(Boolean).join(', ') || 'Kategori terhapus'}
                    </p>
                  </div>
                  <div className="flex shrink-0">
                    <button onClick={() => openEdit(b)} className="p-2 text-text-muted"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(b.id)} className="p-2 text-text-muted"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>

                <div className="flex items-baseline justify-between gap-2 mb-2">
                  <span className="text-lg font-semibold nowrap-nums truncate">{formatRupiah(b.spent)}</span>
                  <span className="text-sm text-text-muted nowrap-nums truncate shrink-0">dari {formatRupiah(b.limitAmount)}</span>
                </div>
                <div className="h-2 rounded-full bg-surface-raised overflow-hidden mb-3">
                  <div className={`h-full rounded-full ${barColor[status]}`} style={{ width: `${Math.min(100, b.percentage)}%` }} />
                </div>
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className={`truncate ${status === 'over' ? 'text-expense' : status === 'warning' ? 'text-brand' : 'text-text-muted'}`}>
                    {Math.round(b.percentage)}% terpakai ·{' '}
                    {b.remaining >= 0 ? `sisa ${formatRupiah(b.remaining)}` : `lebih ${formatRupiah(-b.remaining)}`}
                  </span>
                  <span className="text-text-muted nowrap-nums shrink-0">{formatRupiah(b.dailyPace)}/hari</span>
                </div>
                {status !== 'over' && (
                  <p className={`text-xs mt-2 ${aheadOfPace ? 'text-brand' : 'text-text-muted'}`}>
                    {aheadOfPace ? 'Pengeluaran di atas laju harian anggaran' : 'Pengeluaran masih di bawah laju harian anggaran'}
                  </p>
                )}
              </div>
            )
          })}
        </div>
      )}

      {sheetOpen && <BudgetFormSheet
        open
        onClose={() => setSheetOpen(false)}
        initial={editing ?? undefined}
        onSubmit={async (payload) => {
          if (editing) await updateBudget(editing.id, payload)
          else await addBudget(payload)
        }}
      />}
    </div>
  )
}
