import { useState, useEffect, useCallback } from 'react'
import { STORAGE_KEYS } from '../utils/constants'
import { readStorage, writeStorage } from '../utils/storage'
import { generateId } from '../utils/formatters'

// Gestiona deudas con historial de abonos, persistido en localStorage
export function useDebts() {
  const [debts, setDebts] = useState(() => readStorage(STORAGE_KEYS.DEBTS, []))

  useEffect(() => { writeStorage(STORAGE_KEYS.DEBTS, debts) }, [debts])

  // Registra una nueva deuda con saldo inicial igual al total
  const addDebt = useCallback((data) => {
    const totalAmount = Number(data.totalAmount)
    setDebts(prev => [
      ...prev,
      {
        id:               generateId(),
        creditor:         data.creditor.trim(),
        totalAmount,
        remainingBalance: totalAmount,
        payments:         [],
        createdAt:        new Date().toISOString(),
      },
    ])
  }, [])

  // Registra un abono a una deuda, reduciendo su saldo pendiente
  const addPaymentToDebt = useCallback((debtId, data) => {
    const amount = Number(data.amount)
    setDebts(prev => prev.map(d => {
      if (d.id !== debtId) return d
      return {
        ...d,
        remainingBalance: Math.max(0, d.remainingBalance - amount),
        payments: [
          ...d.payments,
          {
            id:    generateId(),
            amount,
            date:  new Date().toISOString(),
            notes: data.notes?.trim() || '',
          },
        ],
      }
    }))
  }, [])

  // Elimina una deuda por ID
  const deleteDebt = useCallback((id) => {
    setDebts(prev => prev.filter(d => d.id !== id))
  }, [])

  // Total de saldo pendiente en todas las deudas
  const totalDeuda = debts.reduce((s, d) => s + d.remainingBalance, 0)

  return { debts, totalDeuda, addDebt, addPaymentToDebt, deleteDebt }
}
