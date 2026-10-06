export function formatRupiah(amount: number): string {
  const sign = amount < 0 ? '-' : ''
  const abs = Math.abs(Math.round(amount))
  return `${sign}Rp ${abs.toLocaleString('id-ID')}`
}

// Versi ringkas untuk tempat sempit: 1.05jt, 615rb, dst — mirip screenshot referensi
export function formatRupiahCompact(amount: number): string {
  const sign = amount < 0 ? '-' : ''
  const abs = Math.abs(amount)
  if (abs >= 1_000_000) {
    const val = abs / 1_000_000
    return `${sign}Rp ${val.toLocaleString('id-ID', { maximumFractionDigits: 2 })}jt`
  }
  if (abs >= 1_000) {
    const val = abs / 1_000
    return `${sign}Rp ${val.toLocaleString('id-ID', { maximumFractionDigits: 0 })}rb`
  }
  return formatRupiah(amount)
}

export function formatDate(epochMs: number): string {
  return new Date(epochMs).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function formatDateTime(epochMs: number): string {
  return new Date(epochMs).toLocaleString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function monthKey(date: Date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

export function daysInMonth(monthKeyStr: string): number {
  const [y, m] = monthKeyStr.split('-').map(Number)
  return new Date(y, m, 0).getDate()
}

export function dayOfMonth(monthKeyStr: string): number {
  const [y, m] = monthKeyStr.split('-').map(Number)
  const now = new Date()
  if (now.getFullYear() === y && now.getMonth() + 1 === m) return now.getDate()
  return daysInMonth(monthKeyStr) // bulan yang sudah lewat dianggap penuh
}
