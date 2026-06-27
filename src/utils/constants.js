// ─── Claves de localStorage ─────────────────────────────────────
export const STORAGE_KEYS = {
  AUTH:     'app_pagos_auth',
  PAYMENTS: 'app_pagos_payments',
  BALANCE:  'app_pagos_balance',
  DEBTS:    'app_pagos_debts',
  SAVINGS:  'app_pagos_savings',
}

// ─── Credenciales hardcodeadas (sin backend) ────────────────────
export const AUTH_CREDENTIALS = {
  username: 'admin',
  password: '1234',
}

// ─── Tabs de navegación ─────────────────────────────────────────
export const TABS = {
  HOME:     'inicio',
  PAYMENTS: 'pagos',
  DEBTS:    'deudas',
  SAVINGS:  'ahorros',
}

// ─── Categorías de pagos mensuales ──────────────────────────────
export const PAYMENT_CATEGORIES = [
  'Servicios',
  'Alimentación',
  'Transporte',
  'Salud',
  'Arriendo',
  'Educación',
  'Entretenimiento',
  'Suscripciones',
  'Otros',
]

// ─── Localización para formato de moneda ────────────────────────
// Cambiar 'es-CO' por 'es-MX', 'es-AR', etc. según el país
export const LOCALE = 'es-CO'
