import { Link } from 'react-router-dom'
import { AlertTriangle } from 'lucide-react'
import { budgetStatus, useBudgets } from './useBudgets'

/** Banner peringatan di dalam app untuk anggaran yang hampir/sudah melewati limit bulan ini. */
export function BudgetAlerts() {
  const { budgets } = useBudgets()
  const alerts = budgets
    .filter((b) => b.limitAmount > 0 && budgetStatus(b.percentage) !== 'ok')
    .sort((a, b) => b.percentage - a.percentage)

  if (alerts.length === 0) return null

  return (
    <Link to="/anggaran" className="flex flex-col gap-2 mb-5">
      {alerts.map((b) => {
        const over = budgetStatus(b.percentage) === 'over'
        return (
          <div
            key={b.id}
            className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm ${
              over ? 'bg-expense-soft text-expense' : 'bg-brand-soft text-brand'
            }`}
          >
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>
              {over
                ? `Anggaran "${b.name}" melewati limit (${Math.round(b.percentage)}%)`
                : `Anggaran "${b.name}" sudah terpakai ${Math.round(b.percentage)}%`}
            </span>
          </div>
        )
      })}
    </Link>
  )
}
