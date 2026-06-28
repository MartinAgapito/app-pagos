const generateId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`

export const STORAGE_KEYS = {
  AUTH:     'app_pagos_auth',
  PAYMENTS: 'app_pagos_payments',
  BALANCE:  'app_pagos_balance',
  DEBTS:    'app_pagos_debts',
  SAVINGS:  'app_pagos_savings',
  CARDS:    'app_pagos_cards',
}

export const AUTH_CREDENTIALS = {
  username: 'admin',
  password: '1234',
}

export const TABS = {
  HOME:      'inicio',
  PAYMENTS:  'pagos',
  DEBTS:     'deudas',
  SAVINGS:   'ahorros',
  MOVEMENTS: 'movimientos',
}

export const PAYMENT_CATEGORIES = [
  'Servicios',
  'Vivienda',
  'Educación',
  'Personal',
  'Suscripción',
  'Cuota',
  'Alimentación',
  'Transporte',
  'Salud',
  'Otros',
]

export const LOCALE = 'es-PE'

const mkPayment = (name, amount, category, linkedDebt = null) => ({
  id:         generateId(),
  name,
  amount,
  dueDay:     1,
  category,
  paid:       false,
  paidAmount: null,
  paidDate:   null,
  linkedDebt,
  createdAt:  new Date().toISOString(),
})

export const INITIAL_PAYMENTS = [
  // Servicios
  mkPayment('Celular Martin',                  31.90,   'Servicios'),
  mkPayment('Celular Paola',                   31.90,   'Servicios'),
  mkPayment('Internet Win',                    69.00,   'Servicios'),
  mkPayment('Luz',                             194.70,  'Servicios'),
  // Vivienda
  mkPayment('Cochera',                         280.00,  'Vivienda'),
  mkPayment('Mantenimiento',                   351.80,  'Vivienda'),
  // Educación
  mkPayment('Colegio MaryLou',                 720.00,  'Educación'),
  // Personal
  mkPayment('Ruleteo',                         360.00,  'Personal'),
  mkPayment('Comida',                          1000.00, 'Personal'),
  // Suscripciones
  mkPayment('ABUCUS.AI',                       34.00,   'Suscripción'),
  // Cuotas de deudas
  mkPayment('Hipotecario · BCP',            1395.18, 'Cuota', { name: 'Hipotecario',     bank: 'BCP'       }),
  mkPayment('Extralinea Auto · Scotiabank', 2021.31, 'Cuota', { name: 'Extralinea Auto', bank: 'Scotiabank' }),
  mkPayment('Tarjeta · Scotiabank',          300.00, 'Cuota'),
  mkPayment('Terreno · Interbank',           248.00, 'Cuota', { name: 'Terreno',          bank: 'Interbank'  }),
]

const mkDebt = (name, bank, originalAmount, remainingBalance, monthlyPayment, tea, totalCuotas, paidCuotas, startDate, monthlyCharges = 0) => ({
  id:               generateId(),
  name,
  bank,
  totalDebt:        originalAmount,
  originalAmount,
  remainingBalance,
  monthlyPayment,
  tea,
  totalCuotas,
  paidCuotas,
  startDate:        startDate || null,
  monthlyCharges,
  dueDay:           1,
  createdAt:        new Date().toISOString(),
})

export const INITIAL_DEBTS = [
  mkDebt('Hipotecario',     'BCP',       183106.80, 153774.29, 1395.18, 8.00, 240, 76, '2020-02-16', 117.35),
  mkDebt('Extralinea Auto', 'Scotiabank',  94000.00,  68477.58, 2021.31, 9.90,  60, 21, '2024-09-09',   0),
  mkDebt('Terreno',         'Interbank',   22320.00,  17112.00,  248.00, 0.00,  90, 22, '2024-08-05',   0),
]

const mkCard = (name, bank, initialBalance, creditLimit) => ({
  id:             generateId(),
  name,
  bank,
  initialBalance,
  creditLimit,
  movements:      [],
})

export const INITIAL_CARDS = [
  mkCard('Tarjeta Crédito', 'Scotiabank', 10890.40, null),
  mkCard('iO',              'iO',             0.00, 1000.00),
]

export const INITIAL_SAVINGS = [
  {
    id:            generateId(),
    name:          'Pichincha',
    targetAmount:  15000,
    currentAmount: 8532.62,
    contributions: [{ id: generateId(), amount: 8532.62, date: new Date().toISOString(), notes: 'Saldo inicial' }],
    createdAt:     new Date().toISOString(),
  },
]
