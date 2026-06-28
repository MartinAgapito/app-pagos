import { useState } from 'react'
import { useAppContext }   from '../context/AppContext'
import { Header }          from '../components/Header'
import { formatCurrency }  from '../utils/formatters'
import { LOCALE }          from '../utils/constants'

function groupByMonth(payments) {
  const paid = payments.filter(p => p.paid && p.paidDate)
  const groups = {}

  paid.forEach(p => {
    const date  = new Date(p.paidDate)
    const key   = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    const label = date.toLocaleDateString(LOCALE, { month: 'long', year: 'numeric' })
    if (!groups[key]) groups[key] = { key, label, items: [], total: 0 }
    groups[key].items.push(p)
    groups[key].total += (p.paidAmount ?? p.amount)
  })

  return Object.values(groups).sort((a, b) => b.key.localeCompare(a.key))
}

function MonthCard({ group }) {
  const [open, setOpen] = useState(false)

  const sorted = [...group.items].sort((a, b) => a.category.localeCompare(b.category))

  return (
    <div className="rounded-2xl border border-rim overflow-hidden" style={{ backgroundColor: 'var(--color-surface)' }}>
      {/* Cabecera del mes — clickeable */}
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-4 py-4 text-left"
      >
        <div>
          <p className="font-semibold text-ink capitalize">{group.label}</p>
          <p className="text-xs text-dim mt-0.5">{group.items.length} pago{group.items.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex items-center gap-3">
          <p
            className="text-base font-medium"
            style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-negative)' }}
          >
            {formatCurrency(group.total)}
          </p>
          <svg
            width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="var(--color-dim)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
          >
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </div>
      </button>

      {/* Detalle expandible */}
      {open && (
        <div className="border-t border-rim">
          {sorted.map(p => (
            <div
              key={p.id}
              className="flex items-center justify-between px-4 py-3 border-b border-rim last:border-b-0"
            >
              <div>
                <p className="text-sm text-ink">{p.name}</p>
                <p className="text-xs text-dim">{p.category}</p>
              </div>
              <div className="text-right">
                <p
                  className="text-sm font-medium"
                  style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-ink)' }}
                >
                  {formatCurrency(p.paidAmount ?? p.amount)}
                </p>
                {p.paidAmount != null && p.paidAmount !== p.amount && (
                  <p className="text-xs" style={{ color: 'var(--color-ghost)' }}>
                    base {formatCurrency(p.amount)}
                  </p>
                )}
              </div>
            </div>
          ))}

          {/* Total del mes al final del detalle */}
          <div className="flex items-center justify-between px-4 py-3" style={{ backgroundColor: 'var(--color-lift)' }}>
            <p className="text-xs font-semibold text-dim uppercase tracking-wider">Total</p>
            <p
              className="text-sm font-semibold"
              style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-negative)' }}
            >
              {formatCurrency(group.total)}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export function Movements() {
  const { payments } = useAppContext()
  const months = groupByMonth(payments)

  return (
    <div className="scroll-container">
      <Header title="Movimientos" subtitle="Historial de pagos por mes" />

      <div className="px-4 py-4 space-y-3 pb-28">
        {months.length === 0 ? (
          <div className="text-center py-20">
            <svg width="40" height="40" className="mx-auto mb-4 opacity-20" viewBox="0 0 24 24" fill="none" stroke="var(--color-dim)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
            <p className="text-dim text-sm">Sin movimientos aún</p>
            <p className="text-ghost text-xs mt-1">Aquí verás el historial cuando marques pagos</p>
          </div>
        ) : (
          months.map(group => <MonthCard key={group.key} group={group} />)
        )}
      </div>
    </div>
  )
}
