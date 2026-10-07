import { formatRupiah } from './format'
import type { CategoryTotal } from './stats'

export interface MonthlyInsightInput {
  income: number
  expense: number
  split: { needs: number; wants: number; other: number; total: number }
  topExpense: CategoryTotal[]
  expenseChangePct: number | null // vs bulan lalu, null kalau tidak ada data pembanding
}

export interface MonthlyInsight {
  headline: string
  paragraph: string
  bullets: string[]
}

const WANTS_IDEAL_MAX = 30 // % dari total pengeluaran — aturan umum needs/wants

export function generateMonthlyInsight(input: MonthlyInsightInput): MonthlyInsight | null {
  const { income, expense, split, topExpense, expenseChangePct } = input
  if (income === 0 && expense === 0) return null

  const net = income - expense
  const savingsRate = income > 0 ? (net / income) * 100 : null
  const wantsPct = split.total > 0 ? (split.wants / split.total) * 100 : 0

  let headline: string
  if (income === 0) {
    headline = 'Belum Ada Pemasukan Bulan Ini'
  } else if (net < 0) {
    headline = 'Waspada, Pengeluaran Melebihi Pemasukan ⚠️'
  } else if (savingsRate !== null && savingsRate >= 20) {
    headline = 'Mantap, Keuanganmu Sehat! 🎉'
  } else {
    headline = 'Positif, Tapi Masih Bisa Dihemat 💪'
  }

  const paragraphParts: string[] = []
  if (income > 0) {
    paragraphParts.push(
      `Pendapatan kamu ${formatRupiah(income)} ${
        net >= 0 ? `cukup untuk menutup pengeluaran ${formatRupiah(expense)}` : `tidak cukup menutup pengeluaran ${formatRupiah(expense)}`
      }, ${net >= 0 ? 'menyisakan' : 'kurang'} ${formatRupiah(Math.abs(net))}${
        savingsRate !== null ? ` (${Math.abs(savingsRate).toFixed(0)}% dari pendapatan)` : ''
      }.`
    )
  } else if (expense > 0) {
    paragraphParts.push(`Belum ada pemasukan tercatat, sementara pengeluaran sudah ${formatRupiah(expense)}.`)
  }
  const paragraph = paragraphParts.join(' ')

  const bullets: string[] = []

  if (split.total > 0) {
    if (wantsPct > WANTS_IDEAL_MAX) {
      bullets.push(
        `⚠️ Porsi "Keinginan" mencapai ${wantsPct.toFixed(0)}% dari pengeluaran, melebihi idealnya sekitar ${WANTS_IDEAL_MAX}%. Coba evaluasi lagi pengeluaran non-esensial.`
      )
    } else {
      bullets.push(`✅ Porsi "Keinginan" ${wantsPct.toFixed(0)}% dari pengeluaran — masih di batas wajar (idealnya ≤${WANTS_IDEAL_MAX}%).`)
    }
  }

  if (topExpense.length > 0) {
    const top = topExpense[0]
    bullets.push(`💡 Kategori pengeluaran terbesar: ${top.name} (${formatRupiah(top.total)}, ${top.percentage.toFixed(0)}% dari total).`)
  }

  if (expenseChangePct !== null) {
    if (expenseChangePct > 10) {
      bullets.push(`📈 Pengeluaran naik ${expenseChangePct.toFixed(0)}% dibanding bulan lalu.`)
    } else if (expenseChangePct < -10) {
      bullets.push(`📉 Pengeluaran turun ${Math.abs(expenseChangePct).toFixed(0)}% dibanding bulan lalu — bagus, ada penghematan.`)
    }
  }

  return { headline, paragraph, bullets }
}
