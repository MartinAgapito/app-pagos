import { useState } from 'react'
import { useAppContext }       from '../context/AppContext'
import { Header }              from '../components/Header'
import { formatCurrency }      from '../utils/formatters'
import { PAYMENT_CATEGORIES }  from '../utils/constants'

// Ícono de check para pagos completados
const IconCheck = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)

// Ícono de eliminar
const IconX = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)

// ─── Formulario colapsable para agregar pago ─────────────────────
function AddPaymentForm({ onAdd, onCancel }) {
  const [form, setForm] = useState({ name: '', amount: '', dueDay: '', category: 'Servicios' })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.amount) return
    onAdd(form)
  }

  const field = (key, opts = {}) => ({
    value:    form[key],
    onChange: e => setForm(f => ({ ...f, [key]: e.target.value })),
    className: 'w-full rounded-xl px-4 py-3 text-ink text-sm outline-none transition-all',
    style: { backgroundColor: 'var(--color-lift)', border: '1px solid var(--color-rim)' },
    onFocus: e => e.target.style.borderColor = 'var(--color-positive)',
    onBlur:  e => e.target.style.borderColor = 'var(--color-rim)',
    ...opts,
  })

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl p-4 border border-rim space-y-3 fade-in"
      style={{ backgroundColor: 'var(--color-surface)' }}
    >
      <input {...field('name')} placeholder="Nombre del pago (ej. Netflix)" required />
      <input {...field('amount')} type="number" placeholder="Monto" min="0" required />
      <input {...field('dueDay')} type="number" placeholder="Día de vencimiento (1–31)" min="1" max="31" />
      <select
        {...field('category')}
        onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
      >
        {PAYMENT_CATEGORIES.map(c => <option key={c}>{c}</option>)}
      </select>

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
          style={{ backgroundColor: 'var(--color-positive)', color: '#09090f' }}
        >
          Guardar
        </button>
      </div>
    </form>
  )
}

// ─── Tarjeta individual de pago ──────────────────────────────────
function PaymentCard({ payment, onToggle, onDelete }) {
  const { id, name, amount, dueDay, category, paid } = payment

  return (
    <div
      className="rounded-2xl px-4 py-3.5 border border-rim flex items-center gap-3 transition-opacity"
      style={{ backgroundColor: 'var(--color-surface)', opacity: paid ? 0.55 : 1 }}
    >
      {/* Botón de marcar pagado */}
      <button
        onClick={() => onToggle(id)}
        className="flex-shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all"
        style={{
          borderColor:     paid ? 'var(--color-positive)' : 'var(--color-ghost)',
          backgroundColor: paid ? 'var(--color-positive)' : 'transparent',
          color:           paid ? '#09090f' : 'transparent',
        }}
      >
        {paid && <IconCheck />}
      </button>

      {/* Info del pago */}
      <div className="flex-1 min-w-0">
        <p
          className="text-sm font-medium text-ink truncate"
          style={{ textDecoration: paid ? 'line-through' : 'none', color: paid ? 'var(--color-dim)' : 'var(--color-ink)' }}
        >
          {name}
        </p>
        <p className="text-xs text-dim">
          {category}{dueDay ? ` · Día ${dueDay}` : ''}
        </p>
      </div>

      {/* Monto */}
      <p
        className="text-sm font-medium flex-shrink-0"
        style={{
          fontFamily: 'var(--font-mono)',
          color: paid ? 'var(--color-positive)' : 'var(--color-ink)',
        }}
      >
        {formatCurrency(amount)}
      </p>

      {/* Botón eliminar */}
      <button
        onClick={() => onDelete(id)}
        className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg transition-colors"
        style={{ color: 'var(--color-ghost)' }}
        onMouseEnter={e => e.currentTarget.style.color = 'var(--color-negative)'}
        onMouseLeave={e => e.currentTarget.style.color = 'var(--color-ghost)'}
      >
        <IconX />
      </button>
    </div>
  )
}

// ─── Página principal de Pagos ───────────────────────────────────
export function Payments() {
  const { payments, addPayment, togglePaid, deletePayment, totalPagado, totalPendiente } = useAppContext()
  const [showForm, setShowForm] = useState(false)

  // Pendientes primero, luego pagados
  const sorted = [...payments].sort((a, b) => {
    if (a.paid !== b.paid) return a.paid ? 1 : -1
    return (a.dueDay || 99) - (b.dueDay || 99)
  })

  const pendienteCount = payments.filter(p => !p.paid).length

  return (
    <div className="scroll-container">
      <Header
        title="Pagos Mensuales"
        subtitle={`${pendienteCount} pendiente${pendienteCount !== 1 ? 's' : ''}`}
      />

      <div className="px-4 py-4 space-y-4 pb-28">
        {/* Resumen rápido */}
        {payments.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl p-3 border border-rim" style={{ backgroundColor: 'var(--color-surface)' }}>
              <p className="text-xs text-dim mb-1">Pagado</p>
              <p className="text-sm font-medium" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-positive)' }}>
                {formatCurrency(totalPagado)}
              </p>
            </div>
            <div className="rounded-xl p-3 border border-rim" style={{ backgroundColor: 'var(--color-surface)' }}>
              <p className="text-xs text-dim mb-1">Pendiente</p>
              <p className="text-sm font-medium" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-negative)' }}>
                {formatCurrency(totalPendiente)}
              </p>
            </div>
          </div>
        )}

        {/* Botón agregar */}
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="w-full rounded-xl py-3 text-sm font-semibold border border-dashed transition-colors"
            style={{
              borderColor:     'var(--color-ghost)',
              color:           'var(--color-dim)',
              backgroundColor: 'transparent',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'var(--color-positive)'
              e.currentTarget.style.color       = 'var(--color-positive)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--color-ghost)'
              e.currentTarget.style.color       = 'var(--color-dim)'
            }}
          >
            + Agregar pago
          </button>
        )}

        {/* Formulario de nuevo pago */}
        {showForm && (
          <AddPaymentForm
            onAdd={(data) => { addPayment(data); setShowForm(false) }}
            onCancel={() => setShowForm(false)}
          />
        )}

        {/* Lista de pagos */}
        {sorted.length === 0 ? (
          <div className="text-center py-16">
            <svg width="40" height="40" className="mx-auto mb-4 opacity-20" viewBox="0 0 24 24" fill="none" stroke="var(--color-dim)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="5" width="20" height="14" rx="2"/>
              <line x1="2" y1="10" x2="22" y2="10"/>
            </svg>
            <p className="text-dim text-sm">No hay pagos registrados</p>
            <p className="text-ghost text-xs mt-1">Agrega tus pagos fijos del mes</p>
          </div>
        ) : (
          <div className="space-y-2">
            {sorted.map(p => (
              <PaymentCard
                key={p.id}
                payment={p}
                onToggle={togglePaid}
                onDelete={deletePayment}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
