import { LOCALE } from './constants'

export function formatCurrency(amount) {
  const num = Number(amount) || 0
  const abs = Math.abs(num)
  const formatted = abs.toLocaleString(LOCALE, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  return num < 0 ? `- S/ ${formatted}` : `S/ ${formatted}`
}

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

export function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export function calcProgress(current, target) {
  if (!target || target <= 0) return 0
  return Math.min(100, Math.max(0, Math.round((current / target) * 100)))
}
