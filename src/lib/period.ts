export function shiftMonth(key: string, delta: number): string {
  const [y, m] = key.split('-').map(Number)
  const d = new Date(y, m - 1 + delta, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

/** [start, end) dalam epoch ms untuk sebuah bulan 'YYYY-MM' */
export function monthRange(key: string): [number, number] {
  const [y, m] = key.split('-').map(Number)
  return [new Date(y, m - 1, 1).getTime(), new Date(y, m, 1).getTime()]
}

export function monthLabel(key: string): string {
  const [y, m] = key.split('-').map(Number)
  return new Date(y, m - 1, 1).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
}

export function monthShortLabel(key: string): string {
  const [y, m] = key.split('-').map(Number)
  return new Date(y, m - 1, 1).toLocaleDateString('id-ID', { month: 'short' })
}

/** [start, end) untuk minggu (Senin-Minggu) relatif ke minggu ini. offset -1 = minggu lalu, dst. */
export function weekRange(offsetWeeks: number): [number, number] {
  const now = new Date()
  const day = now.getDay() === 0 ? 7 : now.getDay() // Senin=1 ... Minggu=7
  const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (day - 1) + offsetWeeks * 7)
  monday.setHours(0, 0, 0, 0)
  const nextMonday = new Date(monday)
  nextMonday.setDate(monday.getDate() + 7)
  return [monday.getTime(), nextMonday.getTime()]
}

export function weekLabel(offsetWeeks: number): string {
  const [start, endExclusive] = weekRange(offsetWeeks)
  const end = endExclusive - 86400000
  const fmt = (ms: number) => new Date(ms).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
  return offsetWeeks === 0 ? `Minggu ini (${fmt(start)} - ${fmt(end)})` : `${fmt(start)} - ${fmt(end)}`
}
