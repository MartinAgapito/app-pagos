import { useState, useEffect, useCallback } from 'react'
import { STORAGE_KEYS } from '../utils/constants'
import { readStorage, writeStorage } from '../utils/storage'
import { generateId } from '../utils/formatters'

// Gestiona pagos mensuales y saldo disponible, con persistencia en localStorage
export function usePayments() {
  const [payments, setPayments] = useState(() => readStorage(STORAGE_KEYS.PAYMENTS, []))
  const [balance, setBalance]   = useState(() => readStorage(STORAGE_KEYS.BALANCE, 0))

  // Sincroniza con localStorage en cada cambio
  useEffect(() => { writeStorage(STORAGE_KEYS.PAYMENTS, payments) }, [payments])
  useEffect(() => { writeStorage(STORAGE_KEYS.BALANCE, balance) },   [balance])

  // Registra un nuevo pago mensual
  const addPayment = useCallback((data) => {
    setPayments(prev => [
      ...prev,
      {
        id:        generateId(),
        name:      data.name.trim(),
        amount:    Number(data.amount),
        dueDay:    data.dueDay ? Number(data.dueDay) : null,
        category:  data.category || 'Otros',
        paid:      false,
        paidDate:  null,
        createdAt: new Date().toISOString(),
      },
    ])
  }, [])

  // Alterna el estado pagado/pendiente de un pago
  const togglePaid = useCallback((id) => {
    setPayments(prev => prev.map(p =>
      p.id === id
        ? { ...p, paid: !p.paid, paidDate: !p.paid ? new Date().toISOString() : null }
        : p
    ))
  }, [])

  // Elimina un pago por ID
  const deletePayment = useCallback((id) => {
    setPayments(prev => prev.filter(p => p.id !== id))
  }, [])

  // Actualiza el saldo disponible del mes
  const updateBalance = useCallback((value) => {
    setBalance(Number(value) || 0)
  }, [])

  // Totales derivados
  const totalPagado    = payments.filter(p => p.paid).reduce((s, p) => s + p.amount, 0)
  const totalPendiente = payments.filter(p => !p.paid).reduce((s, p) => s + p.amount, 0)
  const saldoRestante  = balance - totalPendiente

  return {
    payments,
    balance,
    totalPagado,
    totalPendiente,
    saldoRestante,
    addPayment,
    togglePaid,
    deletePayment,
    updateBalance,
  }
}
