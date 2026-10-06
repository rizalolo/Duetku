import type { TransactionType } from '../types'

const INCOME_WORDS = ['terima', 'dapat', 'gaji', 'bonus', 'masuk', 'pemasukan', 'dibayar', 'untung']

/**
 * Parser sederhana berbasis aturan (bukan AI) untuk mengubah hasil ucapan jadi perkiraan
 * jumlah & tipe transaksi. Contoh: "beli kopi lima belas ribu" -> amount 15000, type expense.
 * Deskripsi = teks asli dikurangi bagian angka, supaya user tetap bisa cek & koreksi manual.
 */
export function parseVoiceTransaction(raw: string): { amount: number | null; type: TransactionType; description: string } {
  const text = raw.toLowerCase().trim()

  const type: TransactionType = INCOME_WORDS.some((w) => text.includes(w)) ? 'income' : 'expense'

  // Pola: angka diikuti satuan ribu/rb/juta/jt. Contoh: "20 ribu", "20rb", "1.5 juta", "2jt"
  const unitMatch = text.match(/(\d+[.,]?\d*)\s*(ribu|rb|juta|jt)\b/)
  let amount: number | null = null
  let matchedSpan = ''

  if (unitMatch) {
    const num = parseFloat(unitMatch[1].replace(',', '.'))
    const unit = unitMatch[2]
    const multiplier = unit.startsWith('r') ? 1_000 : 1_000_000
    amount = Math.round(num * multiplier)
    matchedSpan = unitMatch[0]
  } else {
    // Fallback: angka polos tanpa satuan, contoh "bayar parkir 5000"
    const plainMatch = text.match(/\d[\d.,]*/)
    if (plainMatch) {
      amount = Math.round(parseFloat(plainMatch[0].replace(/\./g, '').replace(',', '.')))
      matchedSpan = plainMatch[0]
    }
  }

  const description = (matchedSpan ? text.replace(matchedSpan, ' ') : text)
    .replace(/\s+/g, ' ')
    .trim()

  return { amount, type, description: description.charAt(0).toUpperCase() + description.slice(1) }
}
