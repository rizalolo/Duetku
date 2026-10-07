import { useState } from 'react'
import { Plus, HandCoins, Pencil, Trash2 } from 'lucide-react'
import { isPaid, useDebts } from './useDebts'
import { DebtFormSheet } from './DebtFormSheet'
import { PaymentSheet } from './PaymentSheet'
import { Button } from '../../components/ui/Button'
import { EmptyState } from '../../components/ui/EmptyState'
import { formatDate, formatRupiah, formatRupiahCompact } from '../../lib/format'
import type { Debt } from '../../types'

function dueInfo(d: Debt): { text: string; tone: 'muted' | 'warn' | 'over' } {
  const days = Math.ceil((d.dueDate - Date.now()) / 86400000)
  if (days < 0) return { text: `Terlambat ${-days} hari`, tone: 'over' }
  if (days === 0) return { text: 'Jatuh tempo hari ini', tone: 'warn' }
  if (days <= 7) return { text: `${days} hari lagi`, tone: 'warn' }
  return { text: `${days} hari lagi`, tone: 'muted' }
}

const toneClass = { muted: 'text-text-muted', warn: 'text-brand', over: 'text-expense' }

export function DebtsPage({ embedded = false }: { embedded?: boolean }) {
  const { debts, loading, addDebt, updateDebt, deleteDebt, payDebt } = useDebts()
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Debt | null>(null)
  const [paying, setPaying] = useState<Debt | null>(null)

  const active = debts.filter((d) => !isPaid(d)).sort((a, b) => a.dueDate - b.dueDate)
  const paid = debts.filter(isPaid)
  const totalDebt = active.filter((d) => (d.kind ?? 'debt') === 'debt').reduce((s, d) => s + (d.totalAmount - d.paidAmount), 0)
  const totalReceivable = active.filter((d) => (d.kind ?? 'debt') === 'receivable').reduce((s, d) => s + (d.totalAmount - d.paidAmount), 0)

  async function handleDelete(id: string) {
    if (confirm('Hapus catatan ini?')) await deleteDebt(id)
  }

  return (
    <div className={embedded ? '' : 'px-5 pt-6'}>
      {!embedded && (
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-semibold">Hutang</h1>
          <button onClick={() => { setEditing(null); setFormOpen(true) }}
            className="w-9 h-9 rounded-full bg-brand text-bg flex items-center justify-center">
            <Plus className="w-5 h-5" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-surface border border-border rounded-2xl p-4 min-w-0">
          <p className="text-text-muted text-xs mb-1">Sisa hutang</p>
          <p className="text-lg font-semibold nowrap-nums truncate text-expense" title={formatRupiah(totalDebt)}>
            {formatRupiahCompact(totalDebt)}
          </p>
        </div>
        <div className="bg-surface border border-border rounded-2xl p-4 min-w-0">
          <p className="text-text-muted text-xs mb-1">Sisa piutang</p>
          <p className="text-lg font-semibold nowrap-nums truncate text-income" title={formatRupiah(totalReceivable)}>
            {formatRupiahCompact(totalReceivable)}
          </p>
        </div>
      </div>

      {embedded && (
        <button
          onClick={() => { setEditing(null); setFormOpen(true) }}
          className="w-full flex items-center justify-center gap-2 bg-surface-raised border border-border rounded-xl py-3 text-sm font-medium mb-6"
        >
          <Plus className="w-4 h-4" /> Catat Hutang / Piutang
        </button>
      )}

      {loading ? (
        <p className="text-text-muted text-sm text-center py-10">Memuat...</p>
      ) : debts.length === 0 ? (
        <EmptyState icon={HandCoins} title="Belum ada catatan"
          description="Catat hutang atau piutang beserta tenggat waktunya supaya tidak terlewat."
          action={!embedded ? <Button onClick={() => setFormOpen(true)}>Catat Hutang</Button> : undefined} />
      ) : (
        <div className="flex flex-col gap-3 pb-6">
          {[...active, ...paid].map((d) => {
            const kind = d.kind ?? 'debt'
            const isDebtKind = kind === 'debt'
            const done = isPaid(d)
            const info = dueInfo(d)
            const pct = Math.min(100, (d.paidAmount / d.totalAmount) * 100)
            return (
              <div key={d.id} className={`bg-surface border border-border rounded-2xl p-5 ${done ? 'opacity-60' : ''}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${isDebtKind ? 'bg-expense-soft text-expense' : 'bg-income-soft text-income'}`}>
                        {isDebtKind ? 'Hutang' : 'Piutang'}
                      </span>
                    </div>
                    <p className="font-semibold truncate">{d.name}</p>
                    {d.notes && <p className="text-xs text-text-muted truncate">{d.notes}</p>}
                  </div>
                  <div className="flex shrink-0">
                    <button onClick={() => { setEditing(d); setFormOpen(true) }} className="p-2 text-text-muted"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(d.id)} className="p-2 text-text-muted"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
                <div className="flex items-baseline justify-between gap-2 mb-2">
                  <span className="text-lg font-semibold nowrap-nums truncate">{formatRupiah(d.paidAmount)}</span>
                  <span className="text-sm text-text-muted nowrap-nums truncate shrink-0">dari {formatRupiah(d.totalAmount)}</span>
                </div>
                <div className="h-2 rounded-full bg-surface-raised overflow-hidden mb-3">
                  <div className={`h-full rounded-full ${isDebtKind ? 'bg-expense' : 'bg-income'}`} style={{ width: `${pct}%` }} />
                </div>
                <div className="flex items-center justify-between text-xs">
                  {done ? (
                    <span className="text-income">Lunas</span>
                  ) : (
                    <span className={toneClass[info.tone]}>{info.text} · {formatDate(d.dueDate)}</span>
                  )}
                  {!done && (
                    <button onClick={() => setPaying(d)} className="text-brand font-medium text-sm">
                      {isDebtKind ? 'Bayar' : 'Terima'}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {formOpen && (
        <DebtFormSheet open onClose={() => setFormOpen(false)} initial={editing ?? undefined}
          onSubmit={async (p) => {
            if (editing) await updateDebt(editing.id, { ...p, status: editing.paidAmount >= p.totalAmount ? 'paid' : 'active' })
            else await addDebt(p)
          }} />
      )}
      {paying && <PaymentSheet debt={paying} onClose={() => setPaying(null)} onSubmit={(amt, walletId) => payDebt(paying, walletId, amt)} />}
    </div>
  )
}
