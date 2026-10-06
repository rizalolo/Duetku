import type { Category, Transaction, Wallet } from '../types'

export interface ImportRowError {
  row: number
  reason: string
}

export interface ImportResult {
  valid: Omit<Transaction, 'id' | 'createdAt'>[]
  errors: ImportRowError[]
}

function normalizeKey(k: string): string {
  return k.trim().toLowerCase()
}

function pick(row: Record<string, unknown>, ...names: string[]): unknown {
  const map = new Map(Object.entries(row).map(([k, v]) => [normalizeKey(k), v]))
  for (const n of names) {
    const v = map.get(normalizeKey(n))
    if (v !== undefined && v !== null && v !== '') return v
  }
  return undefined
}

function parseAmount(v: unknown): number | null {
  if (typeof v === 'number') return v
  if (typeof v === 'string') {
    const digits = v.replace(/[^\d]/g, '')
    if (!digits) return null
    return Number(digits)
  }
  return null
}

function parseDate(dateVal: unknown, timeVal: unknown): number | null {
  let base: Date | null = null
  if (dateVal instanceof Date) base = dateVal
  else if (typeof dateVal === 'string') {
    const m = dateVal.trim().match(/^(\d{4})-(\d{2})-(\d{2})/)
    if (m) base = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
  } else if (typeof dateVal === 'number') {
    // Excel serial date (hari sejak 1899-12-30)
    base = new Date(Math.round((dateVal - 25569) * 86400 * 1000))
  }
  if (!base || isNaN(base.getTime())) return null

  if (typeof timeVal === 'string') {
    const m = timeVal.trim().match(/^(\d{1,2}):(\d{2})/)
    if (m) base.setHours(Number(m[1]), Number(m[2]), 0, 0)
  } else if (timeVal instanceof Date) {
    base.setHours(timeVal.getHours(), timeVal.getMinutes(), 0, 0)
  }
  return base.getTime()
}

/**
 * Parse baris mentah hasil XLSX.utils.sheet_to_json (sheet 'Transaksi', cocok dengan format
 * Ekspor Excel) menjadi transaksi siap simpan. Kategori & dompet dicocokkan by nama (case-
 * insensitive) ke data yang sudah ada — baris dengan nama yang tidak ketemu akan dilaporkan
 * sebagai error, bukan auto-dibuatkan, supaya tidak muncul kategori/dompet duplikat karena typo.
 */
export function parseImportRows(
  rows: Record<string, unknown>[],
  categories: Category[],
  wallets: Wallet[]
): ImportResult {
  const valid: Omit<Transaction, 'id' | 'createdAt'>[] = []
  const errors: ImportRowError[] = []

  rows.forEach((row, i) => {
    const rowNum = i + 2 // +1 header, +1 karena index mulai 0
    const typeRaw = String(pick(row, 'Tipe', 'Type') ?? '').toLowerCase()
    const type = typeRaw.startsWith('pengeluaran') || typeRaw === 'expense' ? 'expense'
      : typeRaw.startsWith('pemasukan') || typeRaw === 'income' ? 'income'
      : null
    if (!type) return errors.push({ row: rowNum, reason: `Tipe "${typeRaw}" tidak dikenali (harus Pemasukan/Pengeluaran)` })

    const amount = parseAmount(pick(row, 'Jumlah', 'Amount'))
    if (!amount || amount <= 0) return errors.push({ row: rowNum, reason: 'Jumlah tidak valid' })

    const date = parseDate(pick(row, 'Tanggal', 'Date'), pick(row, 'Jam', 'Time'))
    if (!date) return errors.push({ row: rowNum, reason: 'Tanggal tidak valid (format: YYYY-MM-DD)' })

    const categoryName = String(pick(row, 'Kategori', 'Category') ?? '').trim()
    const category = categories.find((c) => c.type === type && c.name.toLowerCase() === categoryName.toLowerCase())
    if (!category) return errors.push({ row: rowNum, reason: `Kategori "${categoryName}" (${type}) tidak ditemukan` })

    const walletName = String(pick(row, 'Dompet', 'Wallet') ?? '').trim()
    const wallet = wallets.find((w) => w.name.toLowerCase() === walletName.toLowerCase())
    if (!wallet) return errors.push({ row: rowNum, reason: `Dompet "${walletName}" tidak ditemukan` })

    const description = String(pick(row, 'Deskripsi', 'Description') ?? '')

    valid.push({
      type,
      amount,
      date,
      categoryId: category.id,
      walletId: wallet.id,
      description,
      source: 'import',
    })
  })

  return { valid, errors }
}
