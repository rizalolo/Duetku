import { BarChart, Bar, XAxis, ResponsiveContainer, Tooltip } from 'recharts'
import { formatRupiahCompact } from '../../lib/format'
import type { MonthTotal } from '../../features/analytics/useAnalytics'

export function MonthCompareChart({ data }: { data: MonthTotal[] }) {
  return (
    <div className="w-full h-44">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} barGap={2}>
          <XAxis
            dataKey="label"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#8b90a0', fontSize: 11 }}
          />
          <Tooltip
            cursor={{ fill: '#ffffff08' }}
            contentStyle={{
              background: '#1d2028',
              border: '1px solid #2a2e38',
              borderRadius: 10,
              fontSize: 12,
            }}
            formatter={(value) => formatRupiahCompact(Number(value))}
            labelStyle={{ color: '#f2f3f5' }}
          />
          <Bar dataKey="income" fill="#34d399" radius={[3, 3, 0, 0]} />
          <Bar dataKey="expense" fill="#fb7185" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
