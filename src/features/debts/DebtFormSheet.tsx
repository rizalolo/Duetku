import { useState, type FormEvent } from 'react'
import { Sheet } from '../../components/ui/Sheet'
import { Button } from '../../components/ui/Button'
import type { Debt, DebtKind } from '../../types'

interface DebtFormSheetProps {
  open: boolean
  onClose: () => void
  onSubmit: (payload: { name: string; kind: DebtKind; totalAmount: number; dueDate: number; notes: string }) => Promise<void>
  initial?: Debt
}

function toDateInput(ms: number) {
  const d = new Date(ms)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function DebtFormSheet({ open, onClose, onSubmit, initial }: DebtFormSheetProps) {
  const [name, setName] = useState(initial?.name ?? '')
  const [kind, setKind] = useState<DebtKind>(initial?.kind ?? 'debt')
  const [total, setTotal] = useState(initial ? String(initial.totalAmount) : '')
  const [due, setDue] = useState(toDateInput(initial?.dueDate ?? Date.now() + 30 * 86400000))
  const [notes, setNotes] = useState(initial?.notes ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const parsed = Number(total.replace(/\D/g, ''))
    if (!name.trim()) return setError('Nama hutang wajib diisi')
    if (!parsed || parsed <= 0) return setError('Jumlah harus lebih dari 0')
    if (initial && parsed < initial.paidAmount) return setError('Jumlah tidak boleh lebih kecil dari yang sudah dibayar')
    if (!due) return setError('Tenggat waktu wajib diisi')
    setSaving(true)
    setError(null)
    try {
      // Tenggat disimpan di akhir hari agar hari-H belum dihitung terlambat
      const [y, m, d] = due.split('-').map(Number)
      await onSubmit({
        name: name.trim(),
        kind,
        totalAmount: parsed,
        dueDate: new Date(y, m - 1, d, 23, 59).getTime(),
        notes: notes.trim(),
      })
      onClose()
    } catch (err) {
      console.error(err)
      setError('Gagal menyimpan. Coba lagi.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Sheet open={open} onClose={onClose} title={initial ? 'Edit Hutang' : 'Hutang Baru'}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex bg-surface-raised border border-border rounded-xl p-1">
          {(['debt', 'receivable'] as const).map((k) => (
            <button
              type="button"
              key={k}
              onClick={() => setKind(k)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium ${
                kind === k ? 'bg-surface text-text border border-border' : 'text-text-muted'
              }`}
            >
              {k === 'debt' ? 'Hutang (saya berhutang)' : 'Piutang (orang berhutang)'}
            </button>
          ))}
        </div>
        <div>
          <label className="text-sm text-text-muted mb-2 block">{kind === 'debt' ? 'Berhutang kepada' : 'Nama peminjam'}</label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder={kind === 'debt' ? 'Contoh: Pinjaman dari Budi' : 'Contoh: Dipinjam oleh Budi'}
            className="w-full bg-surface-raised border border-border rounded-xl px-4 py-3 outline-none focus:border-brand" />
        </div>
        <div>
          <label className="text-sm text-text-muted mb-2 block">{kind === 'debt' ? 'Total hutang' : 'Total piutang'}</label>
          <div className="flex items-center bg-surface-raised border border-border rounded-xl px-4 py-3 focus-within:border-brand">
            <span className="text-text-muted mr-2">Rp</span>
            <input value={total} onChange={(e) => setTotal(e.target.value)} inputMode="numeric" placeholder="0"
              className="flex-1 bg-transparent outline-none tabular-nums" />
          </div>
        </div>
        <div>
          <label className="text-sm text-text-muted mb-2 block">Tenggat bayar</label>
          <input type="date" value={due} onChange={(e) => setDue(e.target.value)}
            className="w-full bg-surface-raised border border-border rounded-xl px-4 py-3 outline-none focus:border-brand" />
        </div>
        <div>
          <label className="text-sm text-text-muted mb-2 block">Catatan (opsional)</label>
          <input value={notes} onChange={(e) => setNotes(e.target.value)}
            className="w-full bg-surface-raised border border-border rounded-xl px-4 py-3 outline-none focus:border-brand" />
        </div>
        {error && <p className="text-expense text-sm">{error}</p>}
        <Button type="submit" disabled={saving} className="w-full mt-2">{saving ? 'Menyimpan...' : 'Simpan'}</Button>
      </form>
    </Sheet>
  )
}
