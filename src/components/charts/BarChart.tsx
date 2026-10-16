interface BarChartProps {
  data: Array<{
    label: string
    value: number
    color: string
  }>
}

export function BarChart({ data }: BarChartProps) {
  const maxValue = Math.max(...data.map((d) => d.value || 0), 100)

  return (
    <div className="space-y-3.5">
      {data.map((item, idx) => {
        const val = item.value && item.value > 0 ? item.value : 0
        const widthPercentage = (val / maxValue) * 100

        return (
          <div key={idx} className="space-y-1.5">
            {/* Label et pourcentage */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-[var(--foreground)] font-semibold">
                {item.label}
              </span>
              <span className="text-[var(--muted)] font-bold">
                {val}%
              </span>
            </div>

            {/* Piste & Barre de progression affinée */}
            <div className="w-full h-4 bg-[var(--track)] rounded-full overflow-hidden p-0.5 border border-[var(--border)] border-opacity-40">
              {val > 0 && (
                <div
                  className="h-full rounded-full transition-all duration-500 ease-out hover:brightness-110"
                  style={{
                    width: `${widthPercentage}%`,
                    backgroundColor: item.color,
                  }}
                />
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}