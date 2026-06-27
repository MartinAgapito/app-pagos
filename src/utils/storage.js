import { STORAGE_KEYS } from './constants'

// Lee un valor de localStorage parseando JSON; retorna fallback si falla
export function readStorage(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key)
    if (raw === null) return fallback
    return JSON.parse(raw)
  } catch {
    return fallback
  }
}

// Escribe un valor en localStorage serializado como JSON
export function writeStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

// Elimina una clave de localStorage
export function removeStorage(key) {
  try {
    localStorage.removeItem(key)
    return true
  } catch {
    return false
  }
}

// ─── Exportar todos los datos de la app a un archivo JSON ───────
export function exportAllData() {
  const data = {
    version:    '1.0',
    exportedAt: new Date().toISOString(),
    payments:   readStorage(STORAGE_KEYS.PAYMENTS, []),
    balance:    readStorage(STORAGE_KEYS.BALANCE, 0),
    debts:      readStorage(STORAGE_KEYS.DEBTS, []),
    savings:    readStorage(STORAGE_KEYS.SAVINGS, []),
  }

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = `app-pagos-backup-${new Date().toISOString().slice(0, 10)}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// ─── Importar datos desde un archivo JSON ───────────────────────
export function importAllData(jsonString) {
  try {
    const data = JSON.parse(jsonString)

    // Validación básica de estructura
    if (!data.version) throw new Error('El archivo no es un backup válido de App Pagos')
    if (!Array.isArray(data.payments)) throw new Error('Datos de pagos inválidos')
    if (!Array.isArray(data.debts))    throw new Error('Datos de deudas inválidos')
    if (!Array.isArray(data.savings))  throw new Error('Datos de ahorros inválidos')

    writeStorage(STORAGE_KEYS.PAYMENTS, data.payments)
    writeStorage(STORAGE_KEYS.BALANCE,  data.balance ?? 0)
    writeStorage(STORAGE_KEYS.DEBTS,    data.debts)
    writeStorage(STORAGE_KEYS.SAVINGS,  data.savings)

    return { success: true }
  } catch (err) {
    return { success: false, error: err.message }
  }
}
