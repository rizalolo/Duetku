import { formatRupiahCompact } from '../../lib/format'

export interface MonthBar {
  label: string
  income: number
  expense: number
  highlight?: boolean
}

export function MonthlyBars({ data }: { data: MonthBar[] }) {
  const max = Math.max(1, ...data.flatMap((d) => [d.income, d.expense]))
  const H = 120
  return (
    <div className="flex items-end justify-between gap-2">
      {data.map((d) => (
        <div key={d.label} className="flex-1 flex flex-col items-center gap-2 min-w-0">
          <div className="flex items-end gap-1" style={{ height: H }}>
            <div
              className="w-3 rounded-t bg-income"
              style={{ height: Math.max(2, (d.income / max) * H), opacity: d.highlight ? 1 : 0.55 }}
              title={`Pemasukan ${formatRupiahCompact(d.income)}`}
            />
            <div
              className="w-3 rounded-t bg-expense"
              style={{ height: Math.max(2, (d.expense / max) * H), opacity: d.highlight ? 1 : 0.55 }}
              title={`Pengeluaran ${formatRupiahCompact(d.expense)}`}
            />
          </div>
          <span className={`text-xs ${d.highlight ? 'text-text' : 'text-text-muted'}`}>{d.label}</span>
        </div>
      ))}
    </div>
  )
}
