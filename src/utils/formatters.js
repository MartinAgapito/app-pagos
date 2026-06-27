import { LOCALE } from './constants'

// Formatea un número como moneda con símbolo $ y separadores de miles
export function formatCurrency(amount) {
  const num = Number(amount) || 0
  const abs = Math.abs(num)
  const formatted = abs.toLocaleString(LOCALE, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
  return num < 0 ? `- $ ${formatted}` : `$ ${formatted}`
}

// Formatea una fecha ISO a formato dd/mm/yyyy en español
export function formatDate(isoString) {
  if (!isoString) return '—'
  try {
    return new Date(isoString).toLocaleDateString(LOCALE, {
      day:   '2-digit',
      month: '2-digit',
      year:  'numeric',
    })
  } catch {
    return '—'
  }
}

// Formatea una fecha ISO a formato legible (ej: "15 jun. 2025")
export function formatDateShort(isoString) {
  if (!isoString) return '—'
  try {
    return new Date(isoString).toLocaleDateString(LOCALE, {
      day:   'numeric',
      month: 'short',
    })
  } catch {
    return '—'
  }
}

// Genera un ID único combinando timestamp + random
export function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

// Calcula porcentaje de progreso, acotado entre 0 y 100
export function calcProgress(current, target) {
  if (!target || target <= 0) return 0
  return Math.min(100, Math.max(0, Math.round((current / target) * 100)))
}
