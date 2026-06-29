import { useState, useEffect, useCallback, useRef } from 'react'
import { STORAGE_KEYS, INITIAL_PAYMENTS } from '../utils/constants'
import { readStorage, writeStorage } from '../utils/storage'
import { generateId } from '../utils/formatters'
import { fetchData, saveData } from '../utils/api'

export function usePayments() {
  const [payments, setPayments] = useState(() => {
    const stored = readStorage(STORAGE_KEYS.PAYMENTS, null)
    if (stored === null) return INITIAL_PAYMENTS
    // Renombrar pago antiguo al nombre actual
    const renamed = stored.map(p =>
      p.name === 'Préstamo Personal · Scotiabank'
        ? { ...p, name: 'Extralinea Auto · Scotiabank' }
        : p
    )
    // Inyectar linkedDebt en pagos que deben tenerlo pero no lo tienen aún
    const enriched = renamed.map(p => {
      const init = INITIAL_PAYMENTS.find(i => i.name === p.name)
      if (!init?.linkedDebt) return p
      if (p.linkedDebt) return p
      return { ...p, linkedDebt: init.linkedDebt }
    })
    // Agrega pagos iniciales que no existan aún
    const missing = INITIAL_PAYMENTS.filter(
      init => !enriched.some(s => s.name === init.name)
    )
    return missing.length > 0 ? [...enriched, ...missing] : enriched
  })
  const [balance, setBalance] = useState(() => readStorage(STORAGE_KEYS.BALANCE, 0))

  // Ref para no sincronizar a la nube antes de cargar los datos de la nube
  const syncReadyRef = useRef(false)

  // Carga inicial desde la nube (sobreescribe localStorage si hay datos más recientes)
  useEffect(() => {
    Promise.all([
      fetchData('payments'),
      fetchData('balance'),
    ]).then(([apiPayments, apiBalance]) => {
      if (apiPayments !== null) {
        setPayments(apiPayments)
        writeStorage(STORAGE_KEYS.PAYMENTS, apiPayments)
      }
      if (apiBalance !== null) {
        setBalance(apiBalance)
        writeStorage(STORAGE_KEYS.BALANCE, apiBalance)
      }
      syncReadyRef.current = true
    })
  }, [])

  useEffect(() => {
    writeStorage(STORAGE_KEYS.PAYMENTS, payments)
    if (syncReadyRef.current) saveData('payments', payments)
  }, [payments])

  useEffect(() => {
    writeStorage(STORAGE_KEYS.BALANCE, balance)
    if (syncReadyRef.current) saveData('balance', balance)
  }, [balance])

  const addPayment = useCallback((data) => {
    setPayments(prev => [
      ...prev,
      {
        id:         generateId(),
        name:       data.name.trim(),
        amount:     Number(data.amount),
        dueDay:     data.dueDay ? Number(data.dueDay) : null,
        category:   data.category || 'Otros',
        paid:       false,
        paidAmount: null,
        paidDate:   null,
        createdAt:  new Date().toISOString(),
      },
    ])
  }, [])

  const togglePaid = useCallback((id, paidAmount = null) => {
    setPayments(prev => prev.map(p => {
      if (p.id !== id) return p
      const markingPaid = !p.paid
      const effectiveAmount = paidAmount ?? p.amount
      return {
        ...p,
        amount:     markingPaid && paidAmount != null ? paidAmount : p.amount,
        paid:       markingPaid,
        paidAmount: markingPaid ? effectiveAmount : null,
        paidDate:   markingPaid ? new Date().toISOString() : null,
      }
    }))
  }, [])

  const deletePayment = useCallback((id) => {
    setPayments(prev => prev.filter(p => p.id !== id))
  }, [])

  const updateBalance = useCallback((value) => {
    setBalance(Number(value) || 0)
  }, [])

  const totalPagado    = payments.filter(p => p.paid).reduce((s, p) => s + (p.paidAmount ?? p.amount), 0)
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
