import { useUserCollection, useFirestoreActions } from '../../lib/firestore'
import { useCategories } from '../categories/useCategories'
import type { Debt, DebtKind, TransactionType } from '../../types'

export function isPaid(d: Debt): boolean {
  return d.paidAmount >= d.totalAmount
}

const CATEGORY_BY_KIND: Record<DebtKind, { name: string; type: TransactionType; icon: string; color: string }> = {
  debt: { name: 'Bayar Hutang', type: 'expense', icon: '💸', color: '#fb7185' },
  receivable: { name: 'Terima Piutang', type: 'income', icon: '💰', color: '#34d399' },
}

export function useDebts() {
  const { data, loading, error } = useUserCollection<Debt>('debts')
  const { add, update, remove } = useFirestoreActions('debts')
  const { add: addTransaction } = useFirestoreActions('transactions')
  const { categories, addCategory } = useCategories()

  async function ensureCategoryId(kind: DebtKind): Promise<string> {
    const spec = CATEGORY_BY_KIND[kind]
    const existing = categories.find((c) => c.name === spec.name && c.type === spec.type)
    if (existing) return existing.id
    const ref = await addCategory({ name: spec.name, type: spec.type, group: null, icon: spec.icon, color: spec.color })
    return ref.id
  }

  return {
    debts: data,
    loading,
    error,
    addDebt: (p: Omit<Debt, 'id' | 'createdAt' | 'paidAmount' | 'status'>) =>
      add({ ...p, paidAmount: 0, status: 'active', createdAt: Date.now() }),
    updateDebt: (id: string, p: Partial<Omit<Debt, 'id'>>) => update(id, p),
    deleteDebt: (id: string) => remove(id),
    /**
     * Catat pembayaran lewat sebuah dompet. Otomatis membuat transaksi (pengeluaran untuk
     * hutang yang kita bayar, pemasukan untuk piutang yang diterima) sehingga saldo dompet
     * ikut berubah dan tercatat juga di Ikhtisar & ekspor Excel.
     */
    async payDebt(debt: Debt, walletId: string, amount: number) {
      const kind: DebtKind = debt.kind ?? 'debt'
      const paidAmount = Math.min(debt.totalAmount, debt.paidAmount + amount)
      const categoryId = await ensureCategoryId(kind)
      await addTransaction({
        walletId,
        categoryId,
        type: CATEGORY_BY_KIND[kind].type,
        amount,
        description: `${kind === 'debt' ? 'Bayar hutang' : 'Terima piutang'}: ${debt.name}`,
        date: Date.now(),
        createdAt: Date.now(),
        source: 'debt',
      })
      await update(debt.id, { paidAmount, status: paidAmount >= debt.totalAmount ? 'paid' : 'active' })
    },
  }
}
