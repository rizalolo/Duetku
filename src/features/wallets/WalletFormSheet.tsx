import { useState, type FormEvent } from 'react'
import { Sheet } from '../../components/ui/Sheet'
import { Button } from '../../components/ui/Button'
import type { Wallet } from '../../types'

const ICON_OPTIONS = ['💵', '🏦', '💳', '👛', '🐷', '📱']

interface WalletFormSheetProps {
  open: boolean
  onClose: () => void
  onSubmit: (payload: { name: string; icon: string; initialBalance: number }) => Promise<void>
  initial?: Wallet
}

export function WalletFormSheet({ open, onClose, onSubmit, initial }: WalletFormSheetProps) {
  const [name, setName] = useState(initial?.name ?? '')
  const [icon, setIcon] = useState(initial?.icon ?? ICON_OPTIONS[0])
  const [balance, setBalance] = useState(initial ? String(initial.initialBalance) : '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!name.trim()) {
      setError('Nama dompet wajib diisi')
      return
    }
    const parsedBalance = Number(balance.replace(/\D/g, '')) || 0
    setSaving(true)
    setError(null)
    try {
      await onSubmit({ name: name.trim(), icon, initialBalance: parsedBalance })
      onClose()
    } catch (err) {
      console.error(err)
      setError('Gagal menyimpan. Coba lagi.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Sheet open={open} onClose={onClose} title={initial ? 'Edit Dompet' : 'Dompet Baru'}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="text-sm text-text-muted mb-2 block">Ikon</label>
          <div className="flex gap-2 flex-wrap">
            {ICON_OPTIONS.map((opt) => (
              <button
                type="button"
                key={opt}
                onClick={() => setIcon(opt)}
                className={`w-11 h-11 rounded-xl text-lg flex items-center justify-center border ${
                  icon === opt ? 'border-brand bg-brand-soft' : 'border-border bg-surface-raised'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-sm text-text-muted mb-2 block">Nama Dompet</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Contoh: Dompet Utama"
            className="w-full bg-surface-raised border border-border rounded-xl px-4 py-3 outline-none focus:border-brand"
          />
        </div>
        <div>
          <label className="text-sm text-text-muted mb-2 block">Saldo Awal</label>
          <input
            value={balance}
            onChange={(e) => setBalance(e.target.value)}
            inputMode="numeric"
            placeholder="0"
            className="w-full bg-surface-raised border border-border rounded-xl px-4 py-3 outline-none focus:border-brand tabular-nums"
          />
        </div>
        {error && <p className="text-expense text-sm">{error}</p>}
        <Button type="submit" disabled={saving} className="w-full mt-2">
          {saving ? 'Menyimpan...' : 'Simpan'}
        </Button>
      </form>
    </Sheet>
  )
}
