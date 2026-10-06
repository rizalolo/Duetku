import type { Budget, Category, Debt, Transaction, Wallet } from '../types'
import { filterByMonth, needsWantsSplit, sumByType } from './stats'

interface ExportData {
  transactions: Transaction[]
  categories: Category[]
  wallets: Wallet[]
  budgets: Budget[]
  debts: Debt[]
}

const pad = (n: number) => String(n).padStart(2, '0')
const dateStr = (ms: number) => {
  const d = new Date(ms)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}
const timeStr = (ms: number) => {
  const d = new Date(ms)
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`
}
const groupLabel = { needs: 'Kebutuhan', wants: 'Keinginan' } as const

/**
 * Ekspor ke .xlsx dengan format "tabel rata": satu baris header, tanpa merge cell,
 * angka disimpan sebagai number, tanggal ISO (YYYY-MM-DD) — supaya mudah dibaca AI / pandas.
 */
export async function exportToExcel(data: ExportData) {
  const XLSX = await import('xlsx')
  const catMap = new Map(data.categories.map((c) => [c.id, c]))
  const walletMap = new Map(data.wallets.map((w) => [w.id, w]))

  const sorted = [...data.transactions].sort((a, b) => a.date - b.date)

  const txRows = sorted.map((t) => {
    const cat = catMap.get(t.categoryId)
    return {
      Tanggal: dateStr(t.date),
      Jam: timeStr(t.date),
      Bulan: dateStr(t.date).slice(0, 7),
      Hari: new Date(t.date).toLocaleDateString('id-ID', { weekday: 'long' }),
      Tipe: t.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
      Kategori: cat?.name ?? 'Tanpa kategori',
      Kelompok: cat?.group ? groupLabel[cat.group] : '-',
      Dompet: walletMap.get(t.walletId)?.name ?? 'Dompet terhapus',
      Jumlah: t.amount,
      Deskripsi: t.description,
      Sumber: t.source,
    }
  })

  const months = Array.from(new Set(sorted.map((t) => dateStr(t.date).slice(0, 7)))).sort()
  const monthlyRows = months.map((m) => {
    const tx = filterByMonth(data.transactions, m)
    const split = needsWantsSplit(tx, catMap)
    const income = sumByType(tx, 'income')
    const expense = sumByType(tx, 'expense')
    return {
      Bulan: m,
      Pemasukan: income,
      Pengeluaran: expense,
      Selisih: income - expense,
      'Pengeluaran Kebutuhan': split.needs,
      'Pengeluaran Keinginan': split.wants,
      'Jumlah Transaksi': tx.length,
    }
  })

  const budgetRows = data.budgets.map((b) => ({
    Nama: b.name,
    'Limit per Bulan': b.limitAmount,
    Kategori: b.categoryIds.map((id) => catMap.get(id)?.name).filter(Boolean).join(', '),
  }))

  const debtRows = data.debts.map((d) => ({
    Nama: d.name,
    Jenis: (d.kind ?? 'debt') === 'debt' ? 'Hutang' : 'Piutang',
    'Total Hutang': d.totalAmount,
    'Sudah Dibayar': d.paidAmount,
    Sisa: d.totalAmount - d.paidAmount,
    Tenggat: dateStr(d.dueDate),
    Status: d.paidAmount >= d.totalAmount ? 'Lunas' : 'Aktif',
    Catatan: d.notes,
  }))

  const info = [
    { Sheet: 'Transaksi', Keterangan: 'Satu baris = satu transaksi, urut dari terlama. Kolom Jumlah selalu positif; arah uang ditentukan kolom Tipe.' },
    { Sheet: 'Ringkasan Bulanan', Keterangan: 'Agregat per bulan (Bulan format YYYY-MM). Selisih = Pemasukan - Pengeluaran.' },
    { Sheet: 'Anggaran', Keterangan: 'Limit anggaran bulanan (berulang tiap bulan) dan kategori yang termasuk.' },
    { Sheet: 'Hutang', Keterangan: 'Daftar hutang, sisa, dan tenggat bayar.' },
    { Sheet: 'Umum', Keterangan: 'Mata uang: Rupiah (IDR), tanpa pemisah ribuan. Kelompok: Kebutuhan / Keinginan (hanya untuk pengeluaran). Tanggal: YYYY-MM-DD, Jam: HH:mm waktu lokal.' },
    { Sheet: 'Diekspor', Keterangan: new Date().toISOString() },
  ]

  const wb = XLSX.utils.book_new()
  const add = (rows: object[], name: string, fallback: object) =>
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows.length ? rows : [fallback]), name)
  add(txRows, 'Transaksi', { Tanggal: '' })
  add(monthlyRows, 'Ringkasan Bulanan', { Bulan: '' })
  add(budgetRows, 'Anggaran', { Nama: '' })
  add(debtRows, 'Hutang', { Nama: '' })
  add(info, 'Info', { Sheet: '' })

  XLSX.writeFile(wb, `keuangan-${dateStr(Date.now())}.xlsx`)
}
