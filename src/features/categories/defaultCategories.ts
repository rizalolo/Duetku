import type { Category } from '../../types'

type SeedCategory = Omit<Category, 'id' | 'createdAt'>

export const DEFAULT_CATEGORIES: SeedCategory[] = [
  // Pengeluaran — Needs
  { name: 'Makan & Minum', type: 'expense', group: 'needs', icon: '🍚', color: '#34d399' },
  { name: 'Rumah Tangga', type: 'expense', group: 'needs', icon: '🏠', color: '#f5a524' },
  { name: 'Transportasi', type: 'expense', group: 'needs', icon: '🚌', color: '#38bdf8' },
  { name: 'Internet & Telepon', type: 'expense', group: 'needs', icon: '📶', color: '#fbbf24' },
  { name: 'Pendidikan', type: 'expense', group: 'needs', icon: '📚', color: '#a78bfa' },
  { name: 'Kesehatan', type: 'expense', group: 'needs', icon: '💊', color: '#f87171' },
  // Pengeluaran — Wants
  { name: 'Belanja Pribadi', type: 'expense', group: 'wants', icon: '🛍️', color: '#c084fc' },
  { name: 'Jajan & Nongkrong', type: 'expense', group: 'wants', icon: '☕', color: '#fb7185' },
  { name: 'Hiburan', type: 'expense', group: 'wants', icon: '🎮', color: '#f472b6' },
  // Pemasukan
  { name: 'Gaji', type: 'income', group: null, icon: '💼', color: '#34d399' },
  { name: 'Bonus', type: 'income', group: null, icon: '🎁', color: '#4ade80' },
  { name: 'Lainnya', type: 'income', group: null, icon: '➕', color: '#a3e635' },
]
