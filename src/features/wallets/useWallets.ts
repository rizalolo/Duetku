import { useMemo } from 'react'
import { useUserCollection, useFirestoreActions } from '../../lib/firestore'
import type { Wallet, Transaction, WalletWithBalance } from '../../types'

export function useWallets() {
  const { data: wallets, loading: loadingWallets, error } = useUserCollection<Wallet>('wallets')
  const { data: transactions, loading: loadingTx } = useUserCollection<Transaction>('transactions')
  const { add, update, remove } = useFirestoreActions('wallets')

  const walletsWithBalance: WalletWithBalance[] = useMemo(() => {
    return wallets.map((wallet) => {
      const walletTx = transactions.filter((t) => t.walletId === wallet.id)
      const totalIncome = walletTx.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0)
      const totalExpense = walletTx.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
      return {
        ...wallet,
        totalIncome,
        totalExpense,
        balance: wallet.initialBalance + totalIncome - totalExpense,
      }
    })
  }, [wallets, transactions])

  function addWallet(payload: Omit<Wallet, 'id' | 'createdAt'>) {
    return add({ ...payload, createdAt: Date.now() })
  }

  function updateWallet(id: string, payload: Partial<Omit<Wallet, 'id'>>) {
    return update(id, payload)
  }

  function deleteWallet(id: string) {
    return remove(id)
  }

  return {
    wallets: walletsWithBalance,
    loading: loadingWallets || loadingTx,
    error,
    addWallet,
    updateWallet,
    deleteWallet,
  }
}
