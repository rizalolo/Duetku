import { useState } from 'react'
import { Plus, Wallet as WalletIcon, Pencil, Trash2 } from 'lucide-react'
import { useWallets } from './useWallets'
import { WalletFormSheet } from './WalletFormSheet'
import { Button } from '../../components/ui/Button'
import { EmptyState } from '../../components/ui/EmptyState'
import { formatRupiah } from '../../lib/format'
import type { WalletWithBalance } from '../../types'

export function WalletsPage() {
  const { wallets, loading, addWallet, updateWallet, deleteWallet } = useWallets()
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editing, setEditing] = useState<WalletWithBalance | null>(null)

  function openCreate() {
    setEditing(null)
    setSheetOpen(true)
  }

  function openEdit(w: WalletWithBalance) {
    setEditing(w)
    setSheetOpen(true)
  }

  async function handleDelete(id: string) {
    if (confirm('Hapus dompet ini? Transaksi yang terkait tidak akan ikut terhapus.')) {
      await deleteWallet(id)
    }
  }

  const totalBalance = wallets.reduce((s, w) => s + w.balance, 0)

  return (
    <div className="px-5 pt-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold">Akun</h1>
        <button
          onClick={openCreate}
          className="w-9 h-9 rounded-full bg-brand text-bg flex items-center justify-center"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      <div className="bg-surface border border-border rounded-2xl p-5 mb-6">
        <p className="text-text-muted text-sm mb-1">Total Saldo</p>
        <p className="text-2xl font-semibold nowrap-nums truncate font-[var(--font-display)]">
          {formatRupiah(totalBalance)}
        </p>
      </div>

      {loading ? (
        <p className="text-text-muted text-sm text-center py-10">Memuat...</p>
      ) : wallets.length === 0 ? (
        <EmptyState
          icon={WalletIcon}
          title="Belum ada dompet"
          description="Buat dompet pertama kamu untuk mulai mencatat transaksi."
          action={<Button onClick={openCreate}>Buat Dompet</Button>}
        />
      ) : (
        <div className="flex flex-col gap-3">
          {wallets.map((w) => (
            <div
              key={w.id}
              className="flex items-center gap-3 bg-surface border border-border rounded-2xl p-4"
            >
              <div className="w-11 h-11 rounded-full bg-surface-raised flex items-center justify-center text-xl shrink-0">
                {w.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{w.name}</p>
                <p className="text-sm nowrap-nums truncate text-text-muted">{formatRupiah(w.balance)}</p>
              </div>
              <button onClick={() => openEdit(w)} className="text-text-muted p-2">
                <Pencil className="w-4 h-4" />
              </button>
              <button onClick={() => handleDelete(w.id)} className="text-text-muted p-2">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {sheetOpen && <WalletFormSheet
        open
        onClose={() => setSheetOpen(false)}
        initial={editing ?? undefined}
        onSubmit={async (payload) => {
          if (editing) {
            await updateWallet(editing.id, payload)
          } else {
            await addWallet(payload)
          }
        }}
      />}
    </div>
  )
}
