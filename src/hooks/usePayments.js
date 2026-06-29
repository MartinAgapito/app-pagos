import { useState, useEffect, useCallback, useRef } from 'react'
import { STORAGE_KEYS, INITIAL_PAYMENTS } from '../utils/constants'
import { readStorage } from '../utils/storage'
import { generateId } from '../utils/formatters'
import { fetchData, saveData } from '../utils/api'

// Si no hay datos en la nube, migra desde localStorage una sola vez
async function loadPayments() {
  const api = await fetchData('payments')
  if (api !== null) return api
  const local = readStorage(STORAGE_KEYS.PAYMENTS, null)
  if (local !== null) { saveData('payments', local); return local }
  return INITIAL_PAYMENTS
}

async function loadBalance() {
  const api = await fetchData('balance')
  if (api !== null) return api
  const local = readStorage(STORAGE_KEYS.BALANCE, null)
  if (local !== null) { saveData('balance', local); return local }
  return 0
}

export function usePayments() {
  const [payments, setPayments] = useState([])
  const [balance,  setBalance]  = useState(0)
  const [isLoaded, setIsLoaded] = useState(false)
  const readyRef = useRef(false)

  useEffect(() => {
    Promise.all([loadPayments(), loadBalance()]).then(([p, b]) => {
      // Aplicar migraciones igual que antes
      const renamed = p.map(x =>
        x.name === 'Préstamo Personal · Scotiabank'
          ? { ...x, name: 'Extralinea Auto · Scotiabank' }
          : x
      )
      const enriched = renamed.map(x => {
        const init = INITIAL_PAYMENTS.find(i => i.name === x.name)
        if (!init?.linkedDebt || x.linkedDebt) return x
        return { ...x, linkedDebt: init.linkedDebt }
      })
      const missing = INITIAL_PAYMENTS.filter(
        init => !enriched.some(s => s.name === init.name)
      )
      const final = missing.length > 0 ? [...enriched, ...missing] : enriched
      setPayments(final)
      setBalance(b)
      readyRef.current = true
      setIsLoaded(true)
    })
  }, [])

  useEffect(() => {
    if (!readyRef.current) return
    saveData('payments', payments)
  }, [payments])

  useEffect(() => {
    if (!readyRef.current) return
    saveData('balance', balance)
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
    payments, balance, totalPagado, totalPendiente, saldoRestante, isLoaded,
    addPayment, togglePaid, deletePayment, updateBalance,
  }
}
