// Semua dokumen disimpan di bawah path: users/{uid}/{collection}/{id}

export type TransactionType = 'income' | 'expense'
export type CategoryGroup = 'needs' | 'wants' | null // null = kategori pemasukan, tidak butuh grouping
export type TransactionSource = 'manual' | 'voice' | 'ocr' | 'import' | 'debt'
export type DebtStatus = 'active' | 'paid'
export type DebtKind = 'debt' | 'receivable' // debt = hutang (kita berhutang), receivable = piutang (orang berhutang ke kita)

export interface Wallet {
  id: string
  name: string
  icon: string // emoji atau nama ikon lucide-react
  initialBalance: number
  createdAt: number // epoch ms
}

export interface Category {
  id: string
  name: string
  type: TransactionType
  group: CategoryGroup
  icon: string
  color: string // hex, dipakai di chart
  createdAt: number
}

export interface Transaction {
  id: string
  walletId: string
  categoryId: string
  type: TransactionType
  amount: number
  description: string
  date: number // epoch ms, tanggal + jam transaksi (bukan createdAt)
  createdAt: number
  source: TransactionSource
}

export interface Budget {
  id: string
  name: string
  categoryIds: string[]
  limitAmount: number // limit per bulan, berlaku berulang tiap bulan
  createdAt: number
}

export interface Debt {
  id: string
  name: string
  kind: DebtKind
  totalAmount: number
  paidAmount: number
  dueDate: number // epoch ms
  status: DebtStatus
  notes: string
  createdAt: number
}

// Turunan (dihitung di client, tidak disimpan)
export interface WalletWithBalance extends Wallet {
  balance: number
  totalIncome: number
  totalExpense: number
}

export interface BudgetProgress extends Budget {
  spent: number
  percentage: number // 0-100+
  remaining: number
  dailyPace: number // limit / jumlah hari di bulan itu
}
