import { calcProgress } from '../utils/formatters'

// Barra de progreso reutilizable con color y animación configurables
export function ProgressBar({ value, max, colorVar = '--color-savings', className = '' }) {
  const pct = calcProgress(value, max)

  return (
    <div className={`w-full bg-ghost rounded-full h-1.5 overflow-hidden ${className}`}>
      <div
        className="h-full rounded-full transition-all duration-700 ease-out"
        style={{
          width:           `${pct}%`,
          backgroundColor: `var(${colorVar})`,
        }}
      />
    </div>
  )
}
