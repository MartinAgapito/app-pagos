import { useState } from 'react'
import { useAppContext }             from '../context/AppContext'
import { Header }                    from '../components/Header'
import { formatCurrency }            from '../utils/formatters'
import { LOCALE }                    from '../utils/constants'
import { useTheme }                  from '../hooks/useTheme'

// ─── Íconos para el toggle de tema ────────────────────────────
const IconSun = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5"/>
    <line x1="12" y1="1" x2="12" y2="3"/>
    <line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/>
    <line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
)

const IconMoon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
)

function StatCard({ label, value, colorVar = '--color-ink' }) {
  return (
    <div className="rounded-2xl p-4 border border-rim" style={{ backgroundColor: 'var(--color-surface)' }}>
      <p className="text-xs text-dim uppercase tracking-wider mb-2">{label}</p>
      <p className="text-sm font-medium whitespace-nowrap overflow-hidden text-ellipsis" style={{ fontFamily: 'var(--font-mono)', color: `var(${colorVar})` }}>
        {value}
      </p>
    </div>
  )
}

export function Home({ onLogout }) {
  const {
    balance, totalPagado, totalPendiente, saldoRestante,
    totalDeuda, totalTarjetas, totalAhorrado, updateBalance, payments,
  } = useAppContext()

  const { isDark, toggleTheme } = useTheme()

  const [editingBalance, setEditingBalance] = useState(false)
  const [tempBalance,    setTempBalance]    = useState('')

  const handleEditBalance = () => {
    setTempBalance(String(balance))
    setEditingBalance(true)
  }

  const handleSaveBalance = () => {
    updateBalance(tempBalance)
    setEditingBalance(false)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSaveBalance()
    if (e.key === 'Escape') setEditingBalance(false)
  }

  const proximos = payments
    .filter(p => !p.paid && p.dueDay)
    .sort((a, b) => a.dueDay - b.dueDay)
    .slice(0, 3)

  const mesActual = new Date().toLocaleDateString(LOCALE, { month: 'long', year: 'numeric' })

  return (
    <div className="scroll-container">
      <Header
        title="App Pagos"
        subtitle={mesActual}
        action={
          <div className="flex items-center gap-1">
            {/* Toggle de tema: luna en modo oscuro, sol en modo claro */}
            <button
              onClick={toggleTheme}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-dim hover:text-ink transition-colors"
              aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            >
              {isDark ? <IconMoon /> : <IconSun />}
            </button>
            <button
              onClick={onLogout}
              className="text-xs text-dim hover:text-ink transition-colors px-2 py-1"
            >
              Salir
            </button>
          </div>
        }
      />

      <div className="px-4 py-5 space-y-5 pb-28">
        {/* Saldo disponible */}
        <div
          className="rounded-3xl p-6 border border-rim relative overflow-hidden slide-up"
          style={{ backgroundColor: 'var(--color-surface)' }}
        >
          <div
            className="absolute -top-10 -right-10 w-48 h-48 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(0, 229, 160, 0.08) 0%, transparent 70%)', filter: 'blur(24px)' }}
          />
          <p className="text-xs text-dim uppercase tracking-widest mb-3">Disponible ahora</p>

          {/* Saldo actual = ingreso − pagado */}
          <p className="text-4xl font-medium text-ink mb-3" style={{ fontFamily: 'var(--font-mono)' }}>
            {formatCurrency(balance - totalPagado)}
          </p>

          {/* Ingreso del mes — editable */}
          {editingBalance ? (
            <div className="flex gap-2 items-center">
              <span className="text-sm font-medium text-dim" style={{ fontFamily: 'var(--font-mono)' }}>Ingreso S/</span>
              <input
                type="number"
                value={tempBalance}
                onChange={e => setTempBalance(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 bg-transparent text-sm font-medium text-ink outline-none"
                style={{ fontFamily: 'var(--font-mono)' }}
                autoFocus
                min="0"
                step="0.01"
              />
              <button
                onClick={handleSaveBalance}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg"
                style={{ backgroundColor: 'var(--color-positive)', color: '#09090f' }}
              >
                OK
              </button>
            </div>
          ) : (
            <button onClick={handleEditBalance} className="text-left group flex items-center gap-2">
              <p className="text-xs text-dim" style={{ fontFamily: 'var(--font-mono)' }}>
                Ingreso: {formatCurrency(balance)}
              </p>
              <p className="text-xs transition-colors group-hover:text-ink" style={{ color: 'var(--color-positive)' }}>
                · Editar
              </p>
            </button>
          )}
        </div>

        {/* Resumen de pagos */}
        <div className="slide-up delay-1">
          <p className="text-xs text-dim uppercase tracking-widest mb-3">Pagos del mes</p>
          <div className="grid grid-cols-3 gap-2">
            <StatCard label="Pagado"    value={formatCurrency(totalPagado)}    colorVar="--color-positive" />
            <StatCard label="Pendiente" value={formatCurrency(totalPendiente)} colorVar="--color-negative" />
            <StatCard
              label="Restante"
              value={formatCurrency(saldoRestante)}
              colorVar={saldoRestante >= 0 ? '--color-ink' : '--color-negative'}
            />
          </div>
        </div>

        {/* Deudas y ahorros */}
        <div className="grid grid-cols-2 gap-3 slide-up delay-2">
          <div className="rounded-2xl p-4 border border-rim" style={{ backgroundColor: 'var(--color-surface)' }}>
            <p className="text-xs text-dim uppercase tracking-wider mb-2">Deuda total</p>
            <p className="text-xl font-medium" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-negative)' }}>
              {formatCurrency(totalDeuda + totalTarjetas)}
            </p>
          </div>
          <div className="rounded-2xl p-4 border border-rim" style={{ backgroundColor: 'var(--color-surface)' }}>
            <p className="text-xs text-dim uppercase tracking-wider mb-2">Total ahorrado</p>
            <p className="text-xl font-medium" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-savings)' }}>
              {formatCurrency(totalAhorrado)}
            </p>
          </div>
        </div>

        {/* Próximos vencimientos */}
        {proximos.length > 0 && (
          <div className="slide-up delay-3">
            <p className="text-xs text-dim uppercase tracking-widest mb-3">Próximos vencimientos</p>
            <div className="rounded-2xl border border-rim overflow-hidden" style={{ backgroundColor: 'var(--color-surface)' }}>
              {proximos.map(p => (
                <div key={p.id} className="flex items-center justify-between px-4 py-3 border-b border-rim last:border-b-0">
                  <div>
                    <p className="text-sm text-ink font-medium">{p.name}</p>
                    <p className="text-xs text-dim">{p.category} · Día {p.dueDay}</p>
                  </div>
                  <p className="text-sm font-medium" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-negative)' }}>
                    {formatCurrency(p.amount)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
