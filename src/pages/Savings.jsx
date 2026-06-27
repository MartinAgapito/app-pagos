import { useState } from 'react'
import { useAppContext }                from '../context/AppContext'
import { Header }                       from '../components/Header'
import { ProgressBar }                  from '../components/ProgressBar'
import { formatCurrency, formatDateShort, calcProgress } from '../utils/formatters'

// ─── Formulario colapsable para nueva meta ───────────────────────
function AddGoalForm({ onAdd, onCancel }) {
  const [form, setForm] = useState({ name: '', targetAmount: '' })

  const field = (key, opts = {}) => ({
    value:    form[key],
    onChange: e => setForm(f => ({ ...f, [key]: e.target.value })),
    className: 'w-full rounded-xl px-4 py-3 text-ink text-sm outline-none transition-all',
    style: { backgroundColor: 'var(--color-lift)', border: '1px solid var(--color-rim)' },
    onFocus: e => e.target.style.borderColor = 'var(--color-savings)',
    onBlur:  e => e.target.style.borderColor = 'var(--color-rim)',
    ...opts,
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.targetAmount) return
    onAdd(form)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl p-4 border border-rim space-y-3 fade-in"
      style={{ backgroundColor: 'var(--color-surface)' }}
    >
      <input {...field('name')} placeholder="Nombre de la meta (ej. Fondo de emergencia)" required />
      <input {...field('targetAmount')} type="number" placeholder="Monto objetivo" min="1" required />

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
          style={{ backgroundColor: 'var(--color-savings)', color: '#fff' }}
        >
          Crear meta
        </button>
      </div>
    </form>
  )
}

// ─── Formulario inline de aporte ─────────────────────────────────
function ContributionForm({ onAdd, onCancel }) {
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
      <p className="text-xs text-dim uppercase tracking-wider">Registrar aporte</p>
      <input
        type="number"
        placeholder="Monto del aporte"
        value={form.amount}
        onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
        className={inputClass}
        style={inputStyle}
        onFocus={e => e.target.style.borderColor = 'var(--color-savings)'}
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
        onFocus={e => e.target.style.borderColor = 'var(--color-savings)'}
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
          style={{ backgroundColor: 'var(--color-savings)', color: '#fff' }}
        >
          Aportar
        </button>
      </div>
    </form>
  )
}

// ─── Tarjeta individual de meta de ahorro ────────────────────────
function GoalCard({ goal, onContribution, onDelete }) {
  const [showHistory, setShowHistory]  = useState(false)
  const [showForm,    setShowForm]     = useState(false)

  const progress   = calcProgress(goal.currentAmount, goal.targetAmount)
  const isComplete = goal.currentAmount >= goal.targetAmount

  return (
    <div className="rounded-2xl border border-rim overflow-hidden" style={{ backgroundColor: 'var(--color-surface)' }}>
      <div className="p-4">
        {/* Cabecera */}
        <div className="flex items-start justify-between mb-1">
          <p className="font-semibold text-ink">{goal.name}</p>
          <span
            className="text-sm font-semibold"
            style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-savings)' }}
          >
            {progress}%
          </span>
        </div>

        {/* Montos */}
        <div className="flex items-center justify-between text-xs text-dim mb-3">
          <span style={{ fontFamily: 'var(--font-mono)' }}>{formatCurrency(goal.currentAmount)} ahorrado</span>
          <span style={{ fontFamily: 'var(--font-mono)' }}>Meta: {formatCurrency(goal.targetAmount)}</span>
        </div>

        {/* Barra de progreso */}
        <ProgressBar
          value={goal.currentAmount}
          max={goal.targetAmount}
          colorVar="--color-savings"
          className="mb-4"
        />

        {isComplete && (
          <p className="text-xs font-medium mb-3" style={{ color: 'var(--color-positive)' }}>
            Meta alcanzada
          </p>
        )}

        {/* Acciones */}
        <div className="flex gap-2">
          <button
            onClick={() => { setShowHistory(v => !v); setShowForm(false) }}
            className="flex-1 rounded-xl py-2.5 text-xs font-medium border border-rim text-dim"
            style={{ backgroundColor: 'var(--color-lift)' }}
          >
            {showHistory ? 'Ocultar' : `Historial (${goal.contributions.length})`}
          </button>
          {!isComplete && (
            <button
              onClick={() => { setShowForm(v => !v); setShowHistory(false) }}
              className="flex-1 rounded-xl py-2.5 text-xs font-semibold"
              style={{ backgroundColor: 'var(--color-savings)', color: '#fff' }}
            >
              {showForm ? 'Cancelar' : 'Aportar'}
            </button>
          )}
          <button
            onClick={() => onDelete(goal.id)}
            className="rounded-xl px-3 py-2.5 text-xs border border-rim text-dim"
            style={{ backgroundColor: 'var(--color-lift)' }}
          >
            Eliminar
          </button>
        </div>
      </div>

      {/* Formulario de aporte */}
      {showForm && (
        <ContributionForm
          onAdd={(data) => { onContribution(goal.id, data); setShowForm(false) }}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* Historial de aportes */}
      {showHistory && (
        <div className="border-t border-rim">
          {goal.contributions.length === 0 ? (
            <p className="text-center text-xs text-dim py-4">Sin aportes registrados</p>
          ) : (
            goal.contributions.map(c => (
              <div
                key={c.id}
                className="flex items-center justify-between px-4 py-3 border-b border-rim last:border-b-0"
              >
                <div>
                  <p className="text-sm text-ink">{formatDateShort(c.date)}</p>
                  {c.notes && <p className="text-xs text-dim">{c.notes}</p>}
                </div>
                <p
                  className="text-sm font-medium"
                  style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-savings)' }}
                >
                  {formatCurrency(c.amount)}
                </p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

// ─── Página principal de Ahorros ─────────────────────────────────
export function Savings() {
  const { savings, totalAhorrado, addSavingGoal, addContribution, deleteSavingGoal } = useAppContext()
  const [showForm, setShowForm] = useState(false)

  const activeGoals   = savings.filter(g => g.currentAmount < g.targetAmount)
  const completedGoals = savings.filter(g => g.currentAmount >= g.targetAmount)

  return (
    <div className="scroll-container">
      <Header
        title="Ahorros"
        subtitle={savings.length > 0 ? `${formatCurrency(totalAhorrado)} acumulado` : 'Sin metas creadas'}
      />

      <div className="px-4 py-4 space-y-4 pb-28">
        {/* Botón nueva meta */}
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="w-full rounded-xl py-3 text-sm font-semibold border border-dashed transition-colors"
            style={{ borderColor: 'var(--color-ghost)', color: 'var(--color-dim)', backgroundColor: 'transparent' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-savings)'; e.currentTarget.style.color = 'var(--color-savings)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-ghost)'; e.currentTarget.style.color = 'var(--color-dim)' }}
          >
            + Nueva meta de ahorro
          </button>
        )}

        {showForm && (
          <AddGoalForm
            onAdd={(data) => { addSavingGoal(data); setShowForm(false) }}
            onCancel={() => setShowForm(false)}
          />
        )}

        {/* Estado vacío */}
        {savings.length === 0 && !showForm && (
          <div className="text-center py-16">
            <svg width="40" height="40" className="mx-auto mb-4 opacity-20" viewBox="0 0 24 24" fill="none" stroke="var(--color-dim)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
              <polyline points="17 6 23 6 23 12"/>
            </svg>
            <p className="text-dim text-sm">No hay metas de ahorro</p>
            <p className="text-ghost text-xs mt-1">Crea tu primera meta y empieza a ahorrar</p>
          </div>
        )}

        {/* Metas activas */}
        {activeGoals.map(goal => (
          <GoalCard key={goal.id} goal={goal} onContribution={addContribution} onDelete={deleteSavingGoal} />
        ))}

        {/* Metas completadas */}
        {completedGoals.length > 0 && (
          <div>
            <p className="text-xs text-dim uppercase tracking-widest mb-3 mt-4">Completadas</p>
            {completedGoals.map(goal => (
              <GoalCard key={goal.id} goal={goal} onContribution={addContribution} onDelete={deleteSavingGoal} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
