import { useState } from 'react'
import { useAppContext }                           from '../context/AppContext'
import { Header }                                  from '../components/Header'
import { ProgressBar }                             from '../components/ProgressBar'
import { formatCurrency, calcProgress, formatDateShort } from '../utils/formatters'

const MOVEMENT_CATEGORIES = [
  'Alimentación', 'Transporte', 'Entretenimiento', 'Salud',
  'Ropa', 'Hogar', 'Educación', 'Comisión', 'Otros',
]

// ─── Formulario para agregar préstamo manual ──────────────────────────────────
function AddDebtForm({ onAdd, onCancel }) {
  const [form, setForm] = useState({ name: '', bank: '', totalDebt: '', monthlyPayment: '' })

  const field = (key, opts = {}) => ({
    value:    form[key],
    onChange: e => setForm(f => ({ ...f, [key]: e.target.value })),
    className: 'w-full rounded-xl px-4 py-3 text-ink text-sm outline-none transition-all',
    style:    { backgroundColor: 'var(--color-lift)', border: '1px solid var(--color-rim)' },
    onFocus:  e => (e.target.style.borderColor = 'var(--color-negative)'),
    onBlur:   e => (e.target.style.borderColor = 'var(--color-rim)'),
    ...opts,
  })

  return (
    <form
      onSubmit={e => { e.preventDefault(); if (!form.name.trim() || !form.totalDebt) return; onAdd(form) }}
      className="rounded-2xl p-4 border border-rim space-y-3 fade-in"
      style={{ backgroundColor: 'var(--color-surface)' }}
    >
      <input {...field('name')} placeholder="Nombre (ej. Préstamo Personal)" required />
      <input {...field('bank')} placeholder="Banco o entidad" />
      <input {...field('totalDebt')} type="number" placeholder="Deuda total" min="1" step="0.01" required />
      <input {...field('monthlyPayment')} type="number" placeholder="Cuota mensual de referencia" min="0" step="0.01" />

      <div className="flex gap-2 pt-1">
        <button type="button" onClick={onCancel}
          className="flex-1 rounded-xl py-3 text-sm font-medium border border-rim text-dim"
          style={{ backgroundColor: 'var(--color-lift)' }}
        >Cancelar</button>
        <button type="submit"
          className="flex-1 rounded-xl py-3 text-sm font-semibold"
          style={{ backgroundColor: 'var(--color-negative)', color: '#fff' }}
        >Registrar</button>
      </div>
    </form>
  )
}

function fmtDate(iso) {
  if (!iso) return null
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

// ─── Tarjeta de préstamo con TEA, cuotas y barra de progreso ─────────────────
function DebtCard({ debt }) {
  const hasCuotas  = debt.totalCuotas > 0 && debt.paidCuotas !== undefined
  const isSettled  = debt.remainingBalance === 0
  const isFixed    = debt.balanceIsTotal   // Scotiabank: deuda fija, se acumula lo pagado

  return (
    <div className="rounded-2xl border border-rim p-4" style={{ backgroundColor: 'var(--color-surface)' }}>
      {/* Encabezado */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0 mr-3">
          <p className="font-semibold text-ink">{debt.name}</p>
          {debt.bank && <p className="text-xs text-dim mt-0.5">{debt.bank}</p>}
          <div className="flex flex-wrap gap-x-3 mt-1.5">
            {debt.tea !== undefined && (
              <span className="text-xs text-dim">TEA {Number(debt.tea).toFixed(2)}%</span>
            )}
            {hasCuotas && (
              <span className="text-xs text-dim">{debt.paidCuotas}/{debt.totalCuotas} cuotas</span>
            )}
            {debt.dueDay && (
              <span className="text-xs text-dim">Día {debt.dueDay}</span>
            )}
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className="text-xs text-dim mb-0.5">{isFixed ? 'Deuda' : 'Pendiente'}</p>
          <p
            className="text-lg font-medium"
            style={{ fontFamily: 'var(--font-mono)', color: isSettled ? 'var(--color-positive)' : 'var(--color-negative)' }}
          >
            {formatCurrency(debt.remainingBalance)}
          </p>
        </div>
      </div>

      {/* Fila de montos */}
      <div className="py-2 border-t border-rim mb-3 space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-dim">Monto original</p>
            <p className="text-sm font-medium text-ink" style={{ fontFamily: 'var(--font-mono)' }}>
              {formatCurrency(debt.originalAmount ?? debt.totalDebt)}
            </p>
          </div>
          {debt.monthlyPayment > 0 && (
            <div className="text-center">
              <p className="text-xs text-dim">Cuota/mes</p>
              <p className="text-sm font-medium text-ink" style={{ fontFamily: 'var(--font-mono)' }}>
                {formatCurrency(debt.monthlyPayment)}
              </p>
            </div>
          )}
          {debt.startDate && (
            <div className="text-right">
              <p className="text-xs text-dim">Adquisición</p>
              <p className="text-sm text-ink">{fmtDate(debt.startDate)}</p>
            </div>
          )}
        </div>

        {/* Total pagado en cuotas — solo deudas con deuda fija */}
        {isFixed && (
          <div className="flex items-center justify-between pt-1 border-t border-rim">
            <p className="text-xs text-dim">Total pagado en cuotas</p>
            <p className="text-sm font-semibold" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-positive)' }}>
              {formatCurrency(debt.amountPaid ?? 0)}
            </p>
          </div>
        )}
      </div>

      {/* Barra de progreso de cuotas */}
      {hasCuotas && (
        <>
          <ProgressBar
            value={debt.paidCuotas}
            max={debt.totalCuotas}
            colorVar="--color-positive"
            className="mb-1.5"
          />
          <p className="text-xs text-dim">{calcProgress(debt.paidCuotas, debt.totalCuotas)}% completado</p>
        </>
      )}
    </div>
  )
}

// ─── Formulario inline para registrar movimiento de tarjeta ──────────────────
function MovementForm({ cardId, onSave, onCancel }) {
  const [form, setForm] = useState({ description: '', amount: '', type: 'gasto', category: 'Otros' })

  const inputClass = 'w-full rounded-xl px-3 py-2.5 text-sm text-ink outline-none'
  const inputStyle = { backgroundColor: 'var(--color-lift)', border: '1px solid var(--color-rim)' }

  return (
    <form
      onSubmit={e => {
        e.preventDefault()
        if (!form.description.trim() || !form.amount) return
        onSave(cardId, form)
      }}
      className="px-4 pt-3 pb-2 space-y-2.5 fade-in"
    >
      <input
        value={form.description}
        onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
        placeholder="Descripción"
        className={inputClass}
        style={inputStyle}
        required
      />
      <input
        type="number"
        value={form.amount}
        onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
        placeholder="Monto"
        min="0.01"
        step="0.01"
        className={inputClass}
        style={inputStyle}
        required
      />
      <div className="flex gap-5 items-center px-1">
        <label className="flex items-center gap-2 text-sm text-ink cursor-pointer">
          <input
            type="radio"
            name={`type-${cardId}`}
            value="gasto"
            checked={form.type === 'gasto'}
            onChange={() => setForm(f => ({ ...f, type: 'gasto' }))}
          />
          Gasto
        </label>
        <label className="flex items-center gap-2 text-sm text-ink cursor-pointer">
          <input
            type="radio"
            name={`type-${cardId}`}
            value="pago"
            checked={form.type === 'pago'}
            onChange={() => setForm(f => ({ ...f, type: 'pago' }))}
          />
          Pago
        </label>
      </div>
      <select
        value={form.category}
        onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
        className={inputClass}
        style={inputStyle}
      >
        {MOVEMENT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
      </select>
      <div className="flex gap-2 pt-1">
        <button type="button" onClick={onCancel}
          className="flex-1 rounded-xl py-2.5 text-sm font-medium border border-rim text-dim"
          style={{ backgroundColor: 'var(--color-lift)' }}
        >Cancelar</button>
        <button type="submit"
          className="flex-1 rounded-xl py-2.5 text-sm font-semibold"
          style={{ backgroundColor: 'var(--color-negative)', color: '#fff' }}
        >Guardar</button>
      </div>
    </form>
  )
}

// ─── Panel de tarjeta de crédito expandible ──────────────────────────────────
function CreditCardPanel({ card, getCardBalance, addMovement, deleteMovement }) {
  const [expanded, setExpanded] = useState(false)
  const [showForm, setShowForm] = useState(false)

  const balance    = getCardBalance(card)
  const hasLimit   = card.creditLimit !== null
  const available  = hasLimit ? card.creditLimit - balance : null
  const usagePct   = hasLimit ? calcProgress(balance, card.creditLimit) : 0

  return (
    <div className="rounded-2xl border border-rim overflow-hidden" style={{ backgroundColor: 'var(--color-surface)' }}>
      {/* Cabecera — toca para expandir */}
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-start justify-between p-4 text-left min-h-[44px]"
      >
        <div>
          <p className="font-semibold text-ink">{card.name}</p>
          <p className="text-xs text-dim mt-0.5">{card.bank}</p>
        </div>
        <div className="text-right">
          <p
            className="text-lg font-medium"
            style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-negative)' }}
          >
            {formatCurrency(balance)}
          </p>
          <p className="text-xs text-dim">
            {hasLimit ? `Usado de S/ ${Number(card.creditLimit).toLocaleString('es-PE', { minimumFractionDigits: 0 })}` : 'Saldo deuda'}
          </p>
        </div>
      </button>

      {/* Barra de uso — solo tarjetas con límite */}
      {hasLimit && (
        <div className="px-4 pb-3">
          <ProgressBar value={balance} max={card.creditLimit} colorVar="--color-negative" className="mb-1.5" />
          <p className="text-xs text-dim">
            {usagePct}% usado · Disponible {formatCurrency(available)}
          </p>
        </div>
      )}

      {/* Sección expandida: movimientos */}
      {expanded && (
        <div className="border-t border-rim">
          {showForm ? (
            <MovementForm
              cardId={card.id}
              onSave={(cardId, data) => { addMovement(cardId, data); setShowForm(false) }}
              onCancel={() => setShowForm(false)}
            />
          ) : (
            <div className="px-4 pt-3 pb-2">
              <button
                onClick={() => setShowForm(true)}
                className="w-full rounded-xl py-2.5 text-sm font-semibold border border-dashed transition-colors min-h-[44px]"
                style={{ borderColor: 'var(--color-ghost)', color: 'var(--color-dim)', backgroundColor: 'transparent' }}
              >
                + Registrar movimiento
              </button>
            </div>
          )}

          {card.movements.length === 0 ? (
            <p className="text-center text-sm py-5 px-4" style={{ color: 'var(--color-dim)' }}>
              Sin movimientos registrados
            </p>
          ) : (
            <div>
              {card.movements.map(m => (
                <div key={m.id} className="flex items-center gap-3 px-4 py-3 border-t border-rim">
                  <span
                    className="text-base w-5 text-center shrink-0"
                    style={{ color: m.type === 'gasto' ? 'var(--color-negative)' : 'var(--color-positive)' }}
                  >
                    {m.type === 'gasto' ? '↑' : '↓'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-ink truncate">{m.description}</p>
                    <p className="text-xs text-dim">{m.category} · {formatDateShort(m.date)}</p>
                  </div>
                  <p
                    className="text-sm font-medium shrink-0"
                    style={{ fontFamily: 'var(--font-mono)', color: m.type === 'gasto' ? 'var(--color-negative)' : 'var(--color-positive)' }}
                  >
                    {formatCurrency(m.amount)}
                  </p>
                  <button
                    onClick={() => deleteMovement(card.id, m.id)}
                    className="shrink-0 w-7 h-7 flex items-center justify-center rounded-full text-xs"
                    style={{ color: 'var(--color-dim)', backgroundColor: 'var(--color-lift)' }}
                    aria-label="Eliminar movimiento"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Página principal Deudas ──────────────────────────────────────────────────
export function Debts() {
  const { debts, addDebt, cards, addMovement, deleteMovement, getCardBalance } = useAppContext()
  const [section, setSection]   = useState('prestamos')
  const [showForm, setShowForm] = useState(false)

  const subtitle = section === 'prestamos'
    ? `${debts.length} préstamo${debts.length !== 1 ? 's' : ''} activo${debts.length !== 1 ? 's' : ''}`
    : cards.map(c => c.bank).join(' · ')

  return (
    <div className="scroll-container">
      <Header title="Deudas" subtitle={subtitle} />

      {/* Segment switcher */}
      <div className="px-4 pt-3 pb-1">
        <div className="flex rounded-xl p-1" style={{ backgroundColor: 'var(--color-surface)' }}>
          {[
            { key: 'prestamos', label: 'Préstamos' },
            { key: 'tarjetas',  label: 'Tarjetas'  },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => { setSection(tab.key); setShowForm(false) }}
              className="flex-1 rounded-lg py-2 text-sm font-medium transition-all min-h-[44px]"
              style={section === tab.key
                ? { backgroundColor: 'var(--color-lift)', color: 'var(--color-ink)' }
                : { backgroundColor: 'transparent', color: 'var(--color-dim)' }
              }
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-3 space-y-4 pb-28">
        {/* ── Sección Préstamos ── */}
        {section === 'prestamos' && (
          <>
            {!showForm && (
              <button
                onClick={() => setShowForm(true)}
                className="w-full rounded-xl py-3 text-sm font-semibold border border-dashed transition-colors min-h-[44px]"
                style={{ borderColor: 'var(--color-ghost)', color: 'var(--color-dim)', backgroundColor: 'transparent' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-negative)'; e.currentTarget.style.color = 'var(--color-negative)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-ghost)';   e.currentTarget.style.color = 'var(--color-dim)' }}
              >
                + Agregar deuda
              </button>
            )}

            {showForm && (
              <AddDebtForm
                onAdd={data => { addDebt(data); setShowForm(false) }}
                onCancel={() => setShowForm(false)}
              />
            )}

            {debts.length === 0 && !showForm && (
              <div className="text-center py-16">
                <p className="text-sm" style={{ color: 'var(--color-dim)' }}>No hay préstamos registrados</p>
              </div>
            )}

            {debts.map(debt => <DebtCard key={debt.id} debt={debt} />)}
          </>
        )}

        {/* ── Sección Tarjetas ── */}
        {section === 'tarjetas' && (
          <>
            {cards.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-sm" style={{ color: 'var(--color-dim)' }}>No hay tarjetas configuradas</p>
              </div>
            ) : (
              cards.map(card => (
                <CreditCardPanel
                  key={card.id}
                  card={card}
                  getCardBalance={getCardBalance}
                  addMovement={addMovement}
                  deleteMovement={deleteMovement}
                />
              ))
            )}
          </>
        )}
      </div>
    </div>
  )
}
