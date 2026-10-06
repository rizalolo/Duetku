import { useState } from 'react'
import { FileSpreadsheet } from 'lucide-react'
import { useTransactions } from '../transactions/useTransactions'
import { useCategories } from '../categories/useCategories'
import { useWallets } from '../wallets/useWallets'
import { useBudgets } from '../budgets/useBudgets'
import { useDebts } from '../debts/useDebts'
import { exportToExcel } from '../../lib/exportExcel'

export function ExportButton() {
  const { transactions, loading: l1 } = useTransactions()
  const { categories } = useCategories()
  const { wallets } = useWallets()
  const { budgets } = useBudgets()
  const { debts } = useDebts()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleExport() {
    setBusy(true)
    setError(null)
    try {
      await exportToExcel({ transactions, categories, wallets, budgets, debts })
    } catch (err) {
      console.error(err)
      setError('Gagal mengekspor. Coba lagi.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <button
        onClick={handleExport}
        disabled={busy || l1}
        className="w-full flex items-center gap-3 bg-surface border border-border rounded-xl p-4 disabled:opacity-60 text-left"
      >
        <FileSpreadsheet className="w-5 h-5 text-text-muted" />
        <span className="flex-1 text-sm font-medium">{busy ? 'Menyiapkan file...' : 'Ekspor ke Excel'}</span>
      </button>
      {error && <p className="text-expense text-sm mt-2">{error}</p>}
    </>
  )
}
