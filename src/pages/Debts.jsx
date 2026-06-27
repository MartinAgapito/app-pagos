import { useState } from 'react'
import { useAppContext }                from '../context/AppContext'
import { Header }                       from '../components/Header'
import { ProgressBar }                  from '../components/ProgressBar'
import { formatCurrency, formatDateShort, calcProgress } from '../utils/formatters'

// ─── Formulario colapsable para nueva deuda ──────────────────────
function AddDebtForm({ onAdd, onCancel }) {
  const [form, setForm] = useState({ creditor: '', totalAmount: '' })

  const field = (key, opts = {}) => ({
    value:    form[key],
    onChange: e => setForm(f => ({ ...f, [key]: e.target.value })),
    className: 'w-full rounded-xl px-4 py-3 text-ink text-sm outline-none transition-all',
    style: { backgroundColor: 'var(--color-lift)', border: '1px solid var(--color-rim)' },
    onFocus: e => e.target.style.borderColor = 'var(--color-negative)',
    onBlur:  e => e.target.style.borderColor = 'var(--color-rim)',
    ...opts,
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.creditor.trim() || !form.totalAmount) return
    onAdd(form)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl p-4 border border-rim space-y-3 fade-in"
      style={{ backgroundColor: 'var(--color-surface)' }}
    >
      <input {...field('creditor')} placeholder="Acreedor (banco, persona, etc.)" required />
      <input {...field('totalAmount')} type="number" placeholder="Monto total de la deuda" min="1" required />

      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 rounded-xl py-3 text-sm font-medium border border-rim text-dim"
          style={{ backgroundColor: 'var(--color-lift)' }}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="flex-1 rounded-xl py-3 text-sm font-semibold"
          style={{ backgroundColor: 'var(--color-negative)', color: '#fff' }}
        >
          Registrar
        </button>
      </div>
    </form>
  )
}

// ─── Formulario inline de abono ──────────────────────────────────
function PaymentForm({ onAdd, onCancel }) {
  const [form, setForm] = useState({ amount: '', notes: '' })

  const inputClass = 'w-full rounded-xl px-4 py-3 text-ink text-sm outline-none transition-all'
  const inputStyle = { backgroundColor: 'var(--color-canvas)', border: '1px solid var(--color-rim)' }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.amount) return
    onAdd(form)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="border-t border-rim px-4 py-4 space-y-3"
      style={{ backgroundColor: 'var(--color-canvas)' }}
    >
      <p className="text-xs text-dim uppercase tracking-wider">Registrar abono</p>
      <input
        type="number"
        placeholder="Monto del abono"
        value={form.amount}
        onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
        className={inputClass}
        style={inputStyle}
        onFocus={e => e.target.style.borderColor = 'var(--color-positive)'}
        onBlur={e  => e.target.style.borderColor = 'var(--color-rim)'}
        min="1"
        required
        autoFocus
      />
      <input
        type="text"
        placeholder="Nota (opcional)"
        value={form.notes}
        onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
        className={inputClass}
        style={inputStyle}
        onFocus={e => e.target.style.borderColor = 'var(--color-positive)'}
        onBlur={e  => e.target.style.borderColor = 'var(--color-rim)'}
      />
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 rounded-xl py-2.5 text-sm font-medium border border-rim text-dim"
          style={{ backgroundColor: 'var(--color-lift)' }}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="flex-1 rounded-xl py-2.5 text-sm font-semibold"
          style={{ backgroundColor: 'var(--color-positive)', color: '#09090f' }}
        >
          Abonar
        </button>
      </div>
    </form>
  )
}

// ─── Tarjeta individual de deuda ─────────────────────────────────
function DebtCard({ debt, onPayment, onDelete }) {
  const [showHistory,  setShowHistory]  = useState(false)
  const [showPayForm,  setShowPayForm]  = useState(false)

  const progress   = calcProgress(debt.totalAmount - debt.remainingBalance, debt.totalAmount)
  const isSettled  = debt.remainingBalance === 0

  return (
    <div className="rounded-2xl border border-rim overflow-hidden" style={{ backgroundColor: 'var(--color-surface)' }}>
      <div className="p-4">
        {/* Cabecera */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="font-semibold text-ink">{debt.creditor}</p>
            <p className="text-xs text-dim mt-0.5">Total: {formatCurrency(debt.totalAmount)}</p>
          </div>
          <div className="text-right">
            <p
              className="text-lg font-medium"
              style={{ fontFamily: 'var(--font-mono)', color: isSettled ? 'var(--color-positive)' : 'var(--color-negative)' }}
            >
              {formatCurrency(debt.remainingBalance)}
            </p>
            <p className="text-xs text-dim">{isSettled ? 'Saldada' : 'pendiente'}</p>
          </div>
        </div>

        {/* Barra de progreso */}
        <ProgressBar
          value={debt.totalAmount - debt.remainingBalance}
          max={debt.totalAmount}
          colorVar="--color-positive"
          className="mb-2"
        />
        <p className="text-xs text-dim mb-4">{progress}% pagado</p>

        {/* Acciones */}
        <div className="flex gap-2">
          <button
            onClick={() => { setShowHistory(v => !v); setShowPayForm(false) }}
            className="flex-1 rounded-xl py-2.5 text-xs font-medium border border-rim text-dim"
            style={{ backgroundColor: 'var(--color-lift)' }}
          >
            {showHistory ? 'Ocultar' : `Historial (${debt.payments.length})`}
          </button>
          {!isSettled && (
            <button
              onClick={() => { setShowPayForm(v => !v); setShowHistory(false) }}
              className="flex-1 rounded-xl py-2.5 text-xs font-semibold"
              style={{ backgroundColor: 'var(--color-positive)', color: '#09090f' }}
            >
              {showPayForm ? 'Cancelar' : 'Abonar'}
            </button>
          )}
          <button
            onClick={() => onDelete(debt.id)}
            className="rounded-xl px-3 py-2.5 text-xs border border-rim text-dim"
            style={{ backgroundColor: 'var(--color-lift)' }}
          >
            Eliminar
          </button>
        </div>
      </div>

      {/* Formulario de abono */}
      {showPayForm && (
        <PaymentForm
          onAdd={(data) => { onPayment(debt.id, data); setShowPayForm(false) }}
          onCancel={() => setShowPayForm(false)}
        />
      )}

      {/* Historial de abonos */}
      {showHistory && (
        <div className="border-t border-rim">
          {debt.payments.length === 0 ? (
            <p className="text-center text-xs text-dim py-4">Sin abonos registrados</p>
          ) : (
            debt.payments.map(p => (
              <div
                key={p.id}
                className="flex items-center justify-between px-4 py-3 border-b border-rim last:border-b-0"
              >
                <div>
                  <p className="text-sm text-ink">{formatDateShort(p.date)}</p>
                  {p.notes && <p className="text-xs text-dim">{p.notes}</p>}
                </div>
                <p
                  className="text-sm font-medium"
                  style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-positive)' }}
                >
                  {formatCurrency(p.amount)}
                </p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

// ─── Página principal de Deudas ──────────────────────────────────
export function Debts() {
  const { debts, totalDeuda, addDebt, addPaymentToDebt, deleteDebt } = useAppContext()
  const [showForm, setShowForm] = useState(false)

  const activeDebts   = debts.filter(d => d.remainingBalance > 0)
  const settledDebts  = debts.filter(d => d.remainingBalance === 0)

  return (
    <div className="scroll-container">
      <Header
        title="Deudas"
        subtitle={activeDebts.length > 0 ? `${formatCurrency(totalDeuda)} pendiente` : 'Sin deudas activas'}
      />

      <div className="px-4 py-4 space-y-4 pb-28">
        {/* Botón agregar */}
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="w-full rounded-xl py-3 text-sm font-semibold border border-dashed transition-colors"
            style={{ borderColor: 'var(--color-ghost)', color: 'var(--color-dim)', backgroundColor: 'transparent' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-negative)'; e.currentTarget.style.color = 'var(--color-negative)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-ghost)'; e.currentTarget.style.color = 'var(--color-dim)' }}
          >
            + Agregar deuda
          </button>
        )}

        {showForm && (
          <AddDebtForm
            onAdd={(data) => { addDebt(data); setShowForm(false) }}
            onCancel={() => setShowForm(false)}
          />
        )}

        {/* Deudas activas */}
        {activeDebts.length === 0 && !showForm && (
          <div className="text-center py-16">
            <svg width="40" height="40" className="mx-auto mb-4 opacity-20" viewBox="0 0 24 24" fill="none" stroke="var(--color-dim)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
              <rect x="9" y="3" width="6" height="4" rx="1"/>
            </svg>
            <p className="text-dim text-sm">No hay deudas activas</p>
            <p className="text-ghost text-xs mt-1">Registra tus deudas para hacer seguimiento</p>
          </div>
        )}

        {activeDebts.map(debt => (
          <DebtCard key={debt.id} debt={debt} onPayment={addPaymentToDebt} onDelete={deleteDebt} />
        ))}

        {/* Deudas saldadas */}
        {settledDebts.length > 0 && (
          <div>
            <p className="text-xs text-dim uppercase tracking-widest mb-3 mt-4">Saldadas</p>
            {settledDebts.map(debt => (
              <DebtCard key={debt.id} debt={debt} onPayment={addPaymentToDebt} onDelete={deleteDebt} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
