interface DonutProps {
  total: number
  segments: Array<{
    value: number
    color: string
    label: string
  }>
}

export function Donut({ total, segments }: DonutProps) {
  let cumulativePercent = 0

  const conicGradient = segments
    .map((segment) => {
      const percent = (segment.value / total) * 100
      const start = cumulativePercent
      const end = cumulativePercent + percent
      cumulativePercent = end
      return `${segment.color} ${start}% ${end}%`
    })
    .join(', ')

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Donut chart */}
      <div className="relative w-32 h-32">
        <div
          className="w-full h-full rounded-full"
          style={{
            background: `conic-gradient(${conicGradient})`,
          }}
        >
          {/* Inner circle */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 rounded-full bg-[var(--card)] border border-[var(--border)] flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl font-bold text-[var(--foreground)]">{total}</div>
                <div className="text-xs text-[var(--muted)]">pièces</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="space-y-2 w-full">
        {segments.map((segment, idx) => (
          <div key={idx} className="flex items-center gap-2 text-sm">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: segment.color }}
            />
            <span className="text-[var(--foreground)]">
              {segment.label}: {segment.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
