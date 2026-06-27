import { useState } from 'react'
import { useAppContext }            from '../context/AppContext'
import { Header }                   from '../components/Header'
import { formatCurrency, formatDate } from '../utils/formatters'
import { exportAllData, importAllData } from '../utils/storage'

// ─── Tarjeta de estadística pequeña ─────────────────────────────
function StatCard({ label, value, colorVar = '--color-ink' }) {
  return (
    <div className="rounded-2xl p-4 border border-rim" style={{ backgroundColor: 'var(--color-surface)' }}>
      <p className="text-xs text-dim uppercase tracking-wider mb-2">{label}</p>
      <p
        className="text-base font-medium"
        style={{ fontFamily: 'var(--font-mono)', color: `var(${colorVar})` }}
      >
        {value}
      </p>
    </div>
  )
}

// ─── Página de inicio: dashboard resumen ─────────────────────────
export function Home({ onLogout }) {
  const {
    balance, totalPagado, totalPendiente, saldoRestante,
    totalDeuda, totalAhorrado, updateBalance,
    payments,
  } = useAppContext()

  const [editingBalance, setEditingBalance] = useState(false)
  const [tempBalance,    setTempBalance]    = useState('')
  const [importMsg,      setImportMsg]      = useState(null)

  // Abre el input de edición de saldo
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

  // Importa un archivo JSON de respaldo
  const handleImport = () => {
    const input = document.createElement('input')
    input.type   = 'file'
    input.accept = '.json,application/json'
    input.onchange = (e) => {
      const file = e.target.files?.[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = (ev) => {
        const result = importAllData(ev.target.result)
        if (result.success) {
          setImportMsg({ ok: true,  text: 'Datos importados correctamente. Recarga la app.' })
        } else {
          setImportMsg({ ok: false, text: `Error: ${result.error}` })
        }
        setTimeout(() => setImportMsg(null), 4000)
      }
      reader.readAsText(file)
    }
    input.click()
  }

  // Próximos vencimientos: pagos pendientes, ordenados por dueDay
  const proximos = payments
    .filter(p => !p.paid && p.dueDay)
    .sort((a, b) => a.dueDay - b.dueDay)
    .slice(0, 3)

  return (
    <div className="scroll-container">
      <Header
        title="App Pagos"
        subtitle={new Date().toLocaleDateString('es-CO', { month: 'long', year: 'numeric' })}
        action={
          <button
            onClick={onLogout}
            className="text-xs text-dim hover:text-ink transition-colors px-2 py-1"
          >
            Salir
          </button>
        }
      />

      <div className="px-4 py-5 space-y-5 pb-28">
        {/* ── Saldo disponible (hero) ── */}
        <div
          className="rounded-3xl p-6 border border-rim relative overflow-hidden slide-up"
          style={{ backgroundColor: 'var(--color-surface)' }}
        >
          {/* Resplandor decorativo */}
          <div
            className="absolute -top-10 -right-10 w-48 h-48 rounded-full pointer-events-none"
            style={{
              background: 'radial-gradient(circle, rgba(0, 229, 160, 0.08) 0%, transparent 70%)',
              filter: 'blur(24px)',
            }}
          />
          <p className="text-xs text-dim uppercase tracking-widest mb-3">Saldo disponible del mes</p>

          {editingBalance ? (
            <div className="flex gap-2 items-center">
              <span className="text-2xl font-medium text-dim" style={{ fontFamily: 'var(--font-mono)' }}>$</span>
              <input
                type="number"
                value={tempBalance}
                onChange={e => setTempBalance(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 bg-transparent text-3xl font-medium text-ink outline-none"
                style={{ fontFamily: 'var(--font-mono)' }}
                autoFocus
                min="0"
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
            <button onClick={handleEditBalance} className="text-left w-full group">
              <p
                className="text-4xl font-medium text-ink"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                {formatCurrency(balance)}
              </p>
              <p className="text-xs mt-2 transition-colors group-hover:text-ink" style={{ color: 'var(--color-positive)' }}>
                Toca para editar
              </p>
            </button>
          )}
        </div>

        {/* ── Resumen de pagos del mes ── */}
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

        {/* ── Deudas y ahorros ── */}
        <div className="grid grid-cols-2 gap-3 slide-up delay-2">
          <div className="rounded-2xl p-4 border border-rim" style={{ backgroundColor: 'var(--color-surface)' }}>
            <p className="text-xs text-dim uppercase tracking-wider mb-2">Deuda total</p>
            <p
              className="text-xl font-medium"
              style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-negative)' }}
            >
              {formatCurrency(totalDeuda)}
            </p>
          </div>
          <div className="rounded-2xl p-4 border border-rim" style={{ backgroundColor: 'var(--color-surface)' }}>
            <p className="text-xs text-dim uppercase tracking-wider mb-2">Total ahorrado</p>
            <p
              className="text-xl font-medium"
              style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-savings)' }}
            >
              {formatCurrency(totalAhorrado)}
            </p>
          </div>
        </div>

        {/* ── Próximos vencimientos ── */}
        {proximos.length > 0 && (
          <div className="slide-up delay-3">
            <p className="text-xs text-dim uppercase tracking-widest mb-3">Próximos vencimientos</p>
            <div
              className="rounded-2xl border border-rim overflow-hidden"
              style={{ backgroundColor: 'var(--color-surface)' }}
            >
              {proximos.map(p => (
                <div key={p.id} className="flex items-center justify-between px-4 py-3 border-b border-rim last:border-b-0">
                  <div>
                    <p className="text-sm text-ink font-medium">{p.name}</p>
                    <p className="text-xs text-dim">Día {p.dueDay}</p>
                  </div>
                  <p
                    className="text-sm font-medium"
                    style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-negative)' }}
                  >
                    {formatCurrency(p.amount)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Exportar / Importar ── */}
        <div className="space-y-2 slide-up delay-4">
          <p className="text-xs text-dim uppercase tracking-widest mb-3">Datos</p>
          <button
            onClick={exportAllData}
            className="w-full rounded-xl py-3 text-sm font-medium border border-rim text-dim hover:text-ink hover:border-ghost transition-colors"
            style={{ backgroundColor: 'var(--color-surface)' }}
          >
            Exportar respaldo (JSON)
          </button>
          <button
            onClick={handleImport}
            className="w-full rounded-xl py-3 text-sm font-medium border border-rim text-dim hover:text-ink hover:border-ghost transition-colors"
            style={{ backgroundColor: 'var(--color-surface)' }}
          >
            Importar respaldo (JSON)
          </button>
          {importMsg && (
            <p
              className="text-xs text-center py-2 fade-in"
              style={{ color: importMsg.ok ? 'var(--color-positive)' : 'var(--color-negative)' }}
            >
              {importMsg.text}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
