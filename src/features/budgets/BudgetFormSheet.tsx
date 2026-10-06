import { useState, type FormEvent } from 'react'
import { Sheet } from '../../components/ui/Sheet'
import { Button } from '../../components/ui/Button'
import { useCategories } from '../categories/useCategories'
import type { Budget } from '../../types'

interface BudgetFormSheetProps {
  open: boolean
  onClose: () => void
  onSubmit: (payload: Omit<Budget, 'id' | 'createdAt'>) => Promise<void>
  initial?: Budget
}

export function BudgetFormSheet({ open, onClose, onSubmit, initial }: BudgetFormSheetProps) {
  const { categories } = useCategories()
  const expenseCategories = categories.filter((c) => c.type === 'expense')

  const [name, setName] = useState(initial?.name ?? '')
  const [limit, setLimit] = useState(initial ? String(initial.limitAmount) : '')
  const [selected, setSelected] = useState<string[]>(initial?.categoryIds ?? [])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function toggle(id: string) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const parsedLimit = Number(limit.replace(/\D/g, ''))
    if (!name.trim()) return setError('Nama anggaran wajib diisi')
    if (!parsedLimit || parsedLimit <= 0) return setError('Limit harus lebih dari 0')
    if (selected.length === 0) return setError('Pilih minimal satu kategori')
    setSaving(true)
    setError(null)
    try {
      await onSubmit({ name: name.trim(), limitAmount: parsedLimit, categoryIds: selected })
      onClose()
    } catch (err) {
      console.error(err)
      setError('Gagal menyimpan. Coba lagi.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Sheet open={open} onClose={onClose} title={initial ? 'Edit Anggaran' : 'Anggaran Baru'}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="text-sm text-text-muted mb-2 block">Nama Anggaran</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Contoh: Makan/jajan"
            className="w-full bg-surface-raised border border-border rounded-xl px-4 py-3 outline-none focus:border-brand"
          />
        </div>
        <div>
          <label className="text-sm text-text-muted mb-2 block">Limit per bulan</label>
          <div className="flex items-center bg-surface-raised border border-border rounded-xl px-4 py-3 focus-within:border-brand">
            <span className="text-text-muted mr-2">Rp</span>
            <input
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
              inputMode="numeric"
              placeholder="0"
              className="flex-1 bg-transparent outline-none tabular-nums"
            />
          </div>
        </div>
        <div>
          <label className="text-sm text-text-muted mb-2 block">Kategori yang masuk anggaran ini</label>
          <div className="flex gap-2 flex-wrap">
            {expenseCategories.map((c) => (
              <button
                type="button"
                key={c.id}
                onClick={() => toggle(c.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-full border text-sm ${
                  selected.includes(c.id) ? 'border-brand bg-brand-soft' : 'border-border bg-surface-raised text-text-muted'
                }`}
              >
                <span>{c.icon}</span>
                {c.name}
              </button>
            ))}
          </div>
        </div>
        {error && <p className="text-expense text-sm">{error}</p>}
        <Button type="submit" disabled={saving} className="w-full mt-2">
          {saving ? 'Menyimpan...' : 'Simpan'}
        </Button>
      </form>
    </Sheet>
  )
}
