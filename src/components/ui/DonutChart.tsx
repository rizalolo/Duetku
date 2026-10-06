import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'

interface DonutChartProps {
  data: { name: string; value: number; color: string }[]
  centerLabel?: string
  centerValue?: string
}

export function DonutChart({ data, centerLabel, centerValue }: DonutChartProps) {
  const hasData = data.some((d) => d.value > 0)

  return (
    <div className="relative w-full h-48">
      {hasData ? (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius="65%"
              outerRadius="95%"
              paddingAngle={2}
              stroke="none"
            >
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <div className="w-full h-full rounded-full border-[14px] border-surface-raised" />
      )}
      {(centerLabel || centerValue) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          {centerValue && <p className="text-lg font-semibold tabular-nums">{centerValue}</p>}
          {centerLabel && <p className="text-xs text-text-muted">{centerLabel}</p>}
        </div>
      )}
    </div>
  )
}
