import { formatRupiah } from '../../lib/format'
import type { CategoryTotal } from '../../lib/stats'

export function CategoryBreakdown({ title, rows, emptyText }: { title: string; rows: CategoryTotal[]; emptyText: string }) {
  return (
    <div className="bg-surface border border-border rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold">{title}</h2>
        <span className="text-xs text-text-muted">{rows.length} kategori</span>
      </div>
      {rows.length === 0 ? (
        <p className="text-sm text-text-muted">{emptyText}</p>
      ) : (
        <div className="flex flex-col gap-4">
          {rows.map((r) => (
            <div key={r.categoryId}>
              <div className="flex items-center gap-3 mb-1.5">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-base shrink-0"
                  style={{ backgroundColor: r.color + '33' }}
                >
                  {r.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{r.name}</p>
                  <p className="text-xs text-text-muted">{r.count} transaksi</p>
                </div>
                <div className="text-right">
                  <p className="text-sm tabular-nums">{formatRupiah(r.total)}</p>
                  <p className="text-xs text-text-muted tabular-nums">{r.percentage.toFixed(1)}%</p>
                </div>
              </div>
              <div className="h-1.5 rounded-full bg-surface-raised overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${r.percentage}%`, backgroundColor: r.color }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
