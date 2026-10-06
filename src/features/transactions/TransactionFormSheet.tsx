import { useEffect, useState, type FormEvent } from 'react'
import { Mic, Square } from 'lucide-react'
import { Sheet } from '../../components/ui/Sheet'
import { Button } from '../../components/ui/Button'
import { useWallets } from '../wallets/useWallets'
import { useCategories } from '../categories/useCategories'
import { useVoiceInput } from '../../lib/useVoiceInput'
import { parseVoiceTransaction } from '../../lib/parseVoiceTransaction'
import type { Transaction, TransactionType } from '../../types'

interface TransactionFormSheetProps {
  open: boolean
  onClose: () => void
  onSubmit: (payload: Omit<Transaction, 'id' | 'createdAt'>) => Promise<void>
  onDelete?: () => Promise<void>
  initial?: Transaction
}

function toLocalInputValue(epochMs: number) {
  const d = new Date(epochMs)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function TransactionFormSheet({ open, onClose, onSubmit, onDelete, initial }: TransactionFormSheetProps) {
  const { wallets } = useWallets()
  const { categories } = useCategories()

  const [type, setType] = useState<TransactionType>(initial?.type ?? 'expense')
  const [walletId, setWalletId] = useState(initial?.walletId ?? '')
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? '')
  const [amount, setAmount] = useState(initial ? String(initial.amount) : '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [dateStr, setDateStr] = useState(toLocalInputValue(initial?.date ?? Date.now()))
  const [source, setSource] = useState(initial?.source ?? 'manual')
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const voice = useVoiceInput()

  // Default dompet & kategori pertama begitu data siap, kalau belum dipilih
  useEffect(() => {
    if (!walletId && wallets.length > 0) setWalletId(wallets[0].id)
  }, [wallets, walletId])

  const filteredCategories = categories.filter((c) => c.type === type)

  useEffect(() => {
    if (filteredCategories.length > 0 && !filteredCategories.some((c) => c.id === categoryId)) {
      setCategoryId(filteredCategories[0].id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, categories])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const parsedAmount = Number(amount.replace(/\D/g, ''))
    if (!parsedAmount || parsedAmount <= 0) {
      setError('Jumlah harus lebih dari 0')
      return
    }
    if (!walletId) {
      setError('Pilih dompet terlebih dulu')
      return
    }
    if (!categoryId) {
      setError('Pilih kategori terlebih dulu')
      return
    }
    setSaving(true)
    setError(null)
    try {
      await onSubmit({
        type,
        walletId,
        categoryId,
        amount: parsedAmount,
        description: description.trim(),
        date: new Date(dateStr).getTime(),
        source,
      })
      onClose()
      setAmount('')
      setDescription('')
    } catch (err) {
      console.error(err)
      setError('Gagal menyimpan. Coba lagi.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!onDelete) return
    if (!confirm('Hapus transaksi ini?')) return
    setDeleting(true)
    setError(null)
    try {
      await onDelete()
      onClose()
    } catch (err) {
      console.error(err)
      setError('Gagal menghapus. Coba lagi.')
      setDeleting(false)
    }
  }

  function handleVoice() {
    if (voice.listening) {
      voice.stop()
      return
    }
    voice.start((text) => {
      const parsed = parseVoiceTransaction(text)
      setType(parsed.type)
      if (parsed.amount) setAmount(String(parsed.amount))
      setDescription(parsed.description)
      setSource('voice')
    })
  }

  return (
    <Sheet open={open} onClose={onClose} title={initial ? 'Edit Transaksi' : 'Transaksi Baru'}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {!initial &&
          (voice.supported ? (
            <button
              type="button"
              onClick={handleVoice}
              className={`flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium border ${
                voice.listening
                  ? 'bg-expense-soft border-expense text-expense animate-pulse'
                  : 'bg-brand-soft border-brand text-brand'
              }`}
            >
              {voice.listening ? <Square className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              {voice.listening ? 'Mendengarkan... ketuk untuk berhenti' : 'Isi dengan suara'}
            </button>
          ) : (
            <p className="text-xs text-text-muted text-center -mb-1">
              Input suara belum didukung di browser ini. Coba buka dengan Chrome, Edge, atau Safari.
            </p>
          ))}
        {voice.error && <p className="text-expense text-sm">{voice.error}</p>}

        <div className="flex bg-surface-raised border border-border rounded-xl p-1">
          {(['expense', 'income'] as const).map((t) => (
            <button
              type="button"
              key={t}
              onClick={() => setType(t)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                type === t
                  ? t === 'expense'
                    ? 'bg-expense-soft text-expense'
                    : 'bg-income-soft text-income'
                  : 'text-text-muted'
              }`}
            >
              {t === 'expense' ? 'Pengeluaran' : 'Pemasukan'}
            </button>
          ))}
        </div>

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
              className="flex-1 bg-transparent outline-none text-lg tabular-nums"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm text-text-muted mb-2 block">Tanggal & Jam</label>
            <input
              type="datetime-local"
              value={dateStr}
              onChange={(e) => setDateStr(e.target.value)}
              className="w-full bg-surface-raised border border-border rounded-xl px-3 py-3 outline-none focus:border-brand text-sm"
            />
          </div>
          <div>
            <label className="text-sm text-text-muted mb-2 block">Dompet</label>
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
        </div>

        <div>
          <label className="text-sm text-text-muted mb-2 block">Kategori</label>
          <div className="flex gap-2 flex-wrap">
            {filteredCategories.map((c) => (
              <button
                type="button"
                key={c.id}
                onClick={() => setCategoryId(c.id)}
                className={`flex flex-col items-center gap-1 w-16 py-2 rounded-xl border text-xs ${
                  categoryId === c.id ? 'border-brand bg-brand-soft' : 'border-border bg-surface-raised'
                }`}
              >
                <span className="text-lg">{c.icon}</span>
                <span className="truncate w-full text-center">{c.name}</span>
              </button>
            ))}
            {filteredCategories.length === 0 && (
              <p className="text-sm text-text-muted">Belum ada kategori untuk tipe ini.</p>
            )}
          </div>
        </div>

        <div>
          <label className="text-sm text-text-muted mb-2 block">Deskripsi (opsional)</label>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Contoh: telor sepapan, mie"
            className="w-full bg-surface-raised border border-border rounded-xl px-4 py-3 outline-none focus:border-brand"
          />
        </div>

        {error && <p className="text-expense text-sm">{error}</p>}
        <Button type="submit" disabled={saving || deleting} className="w-full mt-2">
          {saving ? 'Menyimpan...' : 'Simpan'}
        </Button>
        {initial && onDelete && (
          <Button type="button" variant="danger" disabled={saving || deleting} onClick={handleDelete} className="w-full">
            {deleting ? 'Menghapus...' : 'Hapus Transaksi'}
          </Button>
        )}
      </form>
    </Sheet>
  )
}
