import { useEffect, useState, type FormEvent } from 'react'
import { Sheet } from '../../components/ui/Sheet'
import { Button } from '../../components/ui/Button'
import { useWallets } from '../wallets/useWallets'
import { formatRupiah } from '../../lib/format'
import type { Debt } from '../../types'

interface PaymentSheetProps {
  debt: Debt
  onClose: () => void
  onSubmit: (amount: number, walletId: string) => Promise<void>
}

export function PaymentSheet({ debt, onClose, onSubmit }: PaymentSheetProps) {
  const kind = debt.kind ?? 'debt'
  const isDebt = kind === 'debt'
  const remaining = debt.totalAmount - debt.paidAmount
  const { wallets } = useWallets()
  const [amount, setAmount] = useState('')
  const [walletId, setWalletId] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!walletId && wallets.length > 0) setWalletId(wallets[0].id)
  }, [wallets, walletId])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const parsed = Number(amount.replace(/\D/g, ''))
    if (!parsed || parsed <= 0) return setError('Jumlah harus lebih dari 0')
    if (parsed > remaining) return setError(`Melebihi sisa ${isDebt ? 'hutang' : 'piutang'} (${formatRupiah(remaining)})`)
    if (!walletId) return setError('Pilih dompet terlebih dulu')
    setSaving(true)
    setError(null)
    try {
      await onSubmit(parsed, walletId)
      onClose()
    } catch (err) {
      console.error(err)
      setError('Gagal menyimpan. Coba lagi.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Sheet open onClose={onClose} title={`${isDebt ? 'Bayar' : 'Terima'}: ${debt.name}`}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <p className="text-sm text-text-muted">
          Sisa {isDebt ? 'hutang' : 'piutang'} {formatRupiah(remaining)}
        </p>
        <div>
          <label className="text-sm text-text-muted mb-2 block">Jumlah</label>
          <div className="flex items-center bg-surface-raised border border-border rounded-xl px-4 py-3 focus-within:border-brand">
            <span className="text-text-muted mr-2">Rp</span>
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              inputMode="numeric"
              placeholder="0"
              autoFocus
              className="flex-1 bg-transparent outline-none tabular-nums"
            />
          </div>
          <button type="button" onClick={() => setAmount(String(remaining))} className="text-sm text-brand mt-2">
            {isDebt ? 'Bayar lunas' : 'Terima semua'}
          </button>
        </div>
        <div>
          <label className="text-sm text-text-muted mb-2 block">
            {isDebt ? 'Dibayar dari dompet' : 'Masuk ke dompet'}
          </label>
          <select
            value={walletId}
            onChange={(e) => setWalletId(e.target.value)}
            className="w-full bg-surface-raised border border-border rounded-xl px-3 py-3 outline-none focus:border-brand text-sm"
          >
            {wallets.length === 0 && <option value="">Belum ada dompet</option>}
            {wallets.map((w) => (
              <option key={w.id} value={w.id}>
                {w.icon} {w.name}
              </option>
            ))}
          </select>
        </div>
        {error && <p className="text-expense text-sm">{error}</p>}
        <Button type="submit" disabled={saving} className="w-full">
          {saving ? 'Menyimpan...' : 'Catat ' + (isDebt ? 'pembayaran' : 'penerimaan')}
        </Button>
      </form>
    </Sheet>
  )
}
