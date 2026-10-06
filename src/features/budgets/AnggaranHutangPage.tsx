import { useState } from 'react'
import { BudgetsPage } from './BudgetsPage'
import { DebtsPage } from '../debts/DebtsPage'

type Tab = 'anggaran' | 'hutang'

export function AnggaranHutangPage({ defaultTab = 'anggaran' }: { defaultTab?: Tab }) {
  const [tab, setTab] = useState<Tab>(defaultTab)

  return (
    <div className="px-5 pt-6">
      <h1 className="text-xl font-semibold mb-4">{tab === 'anggaran' ? 'Anggaran' : 'Hutang'}</h1>
      <div className="flex bg-surface-raised border border-border rounded-xl p-1 mb-6">
        {(['anggaran', 'hutang'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium ${
              tab === t ? 'bg-surface text-text border border-border' : 'text-text-muted'
            }`}
          >
            {t === 'anggaran' ? 'Anggaran' : 'Hutang'}
          </button>
        ))}
      </div>
      {tab === 'anggaran' ? <BudgetsPage embedded /> : <DebtsPage embedded />}
    </div>
  )
}
