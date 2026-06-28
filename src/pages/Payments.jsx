import { useState } from 'react'
import { useAppContext }                    from '../context/AppContext'
import { Header }                           from '../components/Header'
import { formatCurrency }                   from '../utils/formatters'
import { PAYMENT_CATEGORIES, INITIAL_PAYMENTS } from '../utils/constants'

const INITIAL_NAMES = new Set(INITIAL_PAYMENTS.map(p => p.name))

const IconCheck = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)

const IconX = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)

const IconUndo = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 14 4 9 9 4"/><path d="M20 20v-7a4 4 0 0 0-4-4H4"/>
  </svg>
)

function AddPaymentForm({ onAdd, onCancel }) {
  const [form, setForm] = useState({ name: '', amount: '', dueDay: '', category: 'Servicios' })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.amount) return
    onAdd(form)
  }

  const field = (key, opts = {}) => ({
    value:     form[key],
    onChange:  e => setForm(f => ({ ...f, [key]: e.target.value })),
    className: 'w-full rounded-xl px-4 py-3 text-ink text-sm outline-none transition-all',
    style:     { backgroundColor: 'var(--color-lift)', border: '1px solid var(--color-rim)' },
    onFocus:   e => e.target.style.borderColor = 'var(--color-positive)',
    onBlur:    e => e.target.style.borderColor = 'var(--color-rim)',
    ...opts,
  })

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl p-4 border border-rim space-y-3 fade-in"
      style={{ backgroundColor: 'var(--color-surface)' }}
    >
      <input {...field('name')} placeholder="Nombre del pago" required />
      <input {...field('amount')} type="number" placeholder="Monto base" min="0" step="0.01" required />
      <input {...field('dueDay')} type="number" placeholder="Día de vencimiento (1–31)" min="1" max="31" />
      <select {...field('category')} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
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

function PaymentCard({ payment, onToggle, onDelete }) {
  const { id, name, amount, paidAmount, dueDay, category, paid } = payment
  const [confirming, setConfirming]     = useState(false)
  const [editAmount, setEditAmount]     = useState(amount)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const isInitial = INITIAL_NAMES.has(name)

  const handleCheckClick = () => {
    if (paid) {
      // Ya pagado → desmarcar directamente
      onToggle(id, null)
    } else {
      // Pendiente → abrir editor de monto
      setEditAmount(amount)
      setConfirming(true)
    }
  }

  const handleConfirm = () => {
    onToggle(id, Number(editAmount))
    setConfirming(false)
  }

  const displayAmount = paid ? (paidAmount ?? amount) : amount
  const amountChanged = paid && paidAmount != null && paidAmount !== amount

  return (
    <div
      className="rounded-2xl border border-rim overflow-hidden transition-opacity"
      style={{ backgroundColor: 'var(--color-surface)', opacity: paid && !confirming ? 0.6 : 1 }}
    >
      <div className="px-4 py-3.5 flex items-center gap-3">
        {/* Botón de check */}
        <button
          onClick={handleCheckClick}
          className="flex-shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all"
          style={{
            borderColor:     paid ? 'var(--color-positive)' : 'var(--color-ghost)',
            backgroundColor: paid ? 'var(--color-positive)' : 'transparent',
            color:           paid ? '#09090f' : 'transparent',
          }}
        >
          {paid && <IconCheck />}
        </button>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p
            className="text-sm font-medium truncate"
            style={{ textDecoration: paid ? 'line-through' : 'none', color: paid ? 'var(--color-dim)' : 'var(--color-ink)' }}
          >
            {name}
          </p>
          <p className="text-xs text-dim">
            {category}{dueDay ? ` · Día ${dueDay}` : ''}
          </p>
        </div>

        {/* Monto */}
        <div className="text-right flex-shrink-0">
          <p
            className="text-sm font-medium"
            style={{ fontFamily: 'var(--font-mono)', color: paid ? 'var(--color-positive)' : 'var(--color-ink)' }}
          >
            {formatCurrency(displayAmount)}
          </p>
          {amountChanged && (
            <p className="text-xs" style={{ color: 'var(--color-ghost)' }}>
              base {formatCurrency(amount)}
            </p>
          )}
        </div>

        {/* Desmarcar (si ya está pagado) */}
        {paid && (
          <button
            onClick={() => onToggle(id, null)}
            className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg transition-colors"
            style={{ color: 'var(--color-dim)' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--color-ink)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--color-dim)'}
            title="Desmarcar pago"
          >
            <IconUndo />
          </button>
        )}

        {/* Eliminar — solo pagos no iniciales y no pagados, con confirmación */}
        {!isInitial && !paid && !confirmDelete && (
          <button
            onClick={() => setConfirmDelete(true)}
            className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg transition-colors"
            style={{ color: 'var(--color-ghost)' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--color-negative)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--color-ghost)'}
          >
            <IconX />
          </button>
        )}
        {!isInitial && !paid && confirmDelete && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => onDelete(id)}
              className="text-xs font-semibold px-2 py-1 rounded-lg"
              style={{ backgroundColor: 'var(--color-negative)', color: '#fff' }}
            >
              Sí
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              className="text-xs px-2 py-1 rounded-lg border border-rim text-dim"
            >
              No
            </button>
          </div>
        )}
      </div>

      {/* Editor de monto al confirmar pago */}
      {confirming && (
        <div
          className="border-t border-rim px-4 py-3 space-y-3"
          style={{ backgroundColor: 'var(--color-canvas)' }}
        >
          <p className="text-xs text-dim uppercase tracking-wider">Monto real pagado</p>
          <input
            type="number"
            value={editAmount}
            onChange={e => setEditAmount(e.target.value)}
            min="0"
            step="0.01"
            autoFocus
            className="w-full rounded-xl px-4 py-3 text-ink text-sm outline-none"
            style={{ backgroundColor: 'var(--color-lift)', border: '1px solid var(--color-positive)' }}
          />
          <div className="flex gap-2">
            <button
              onClick={() => setConfirming(false)}
              className="flex-1 rounded-xl py-2.5 text-sm font-medium border border-rim text-dim"
              style={{ backgroundColor: 'var(--color-lift)' }}
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              className="flex-1 rounded-xl py-2.5 text-sm font-semibold"
              style={{ backgroundColor: 'var(--color-positive)', color: '#09090f' }}
            >
              Confirmar pago
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export function Payments() {
  const { payments, addPayment, togglePaid, deletePayment, totalPagado, totalPendiente } = useAppContext()
  const [showForm, setShowForm] = useState(false)

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

        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="w-full rounded-xl py-3 text-sm font-semibold border border-dashed transition-colors"
            style={{ borderColor: 'var(--color-ghost)', color: 'var(--color-dim)', backgroundColor: 'transparent' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-positive)'; e.currentTarget.style.color = 'var(--color-positive)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-ghost)';   e.currentTarget.style.color = 'var(--color-dim)' }}
          >
            + Agregar pago
          </button>
        )}

        {showForm && (
          <AddPaymentForm
            onAdd={(data) => { addPayment(data); setShowForm(false) }}
            onCancel={() => setShowForm(false)}
          />
        )}

        {sorted.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-dim text-sm">No hay pagos registrados</p>
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
