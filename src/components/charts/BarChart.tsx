interface BarChartProps {
  data: Array<{
    label: string
    value: number
    color: string
  }>
}

export function BarChart({ data }: BarChartProps) {
  const maxValue = Math.max(...data.map((d) => d.value), 100)

  return (
    <div className="space-y-4">
      {data.map((item, idx) => (
        <div key={idx} className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span className="text-[var(--foreground)] font-medium">{item.label}</span>
            <span className="text-[var(--muted)]">{item.value}%</span>
          </div>
          <div className="w-full h-8 bg-[var(--track)] rounded-lg overflow-hidden">
            <div
              className={`h-full bg-[${item.color}] transition-all duration-300 flex items-center justify-end pr-2`}
              style={{
                width: `${(item.value / maxValue) * 100}%`,
                backgroundColor: item.color,
              }}
            >
              {item.value > 20 && (
                <span className="text-xs font-semibold text-white">{item.value}%</span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
