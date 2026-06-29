import { useState, useEffect, useCallback, useRef } from 'react'
import { STORAGE_KEYS, INITIAL_DEBTS } from '../utils/constants'
import { readStorage } from '../utils/storage'
import { generateId } from '../utils/formatters'
import { fetchData, saveData } from '../utils/api'

async function loadDebts() {
  const api = await fetchData('debts')
  if (api !== null) return api
  const local = readStorage(STORAGE_KEYS.DEBTS, null)
  if (local !== null) { saveData('debts', local); return local }
  return INITIAL_DEBTS
}

function migrateDebts(stored) {
  const filtered = stored.filter(s =>
    !(s.name === 'Tarjeta'           && s.bank === 'Scotiabank') &&
    !(s.name === 'Préstamo Personal' && s.bank === 'Scotiabank')
  )
  const updated = filtered.map(s => {
    const init = INITIAL_DEBTS.find(i => i.name === s.name && i.bank === s.bank)
    if (!init) return s
    return {
      ...s,
      tea:            init.tea,
      totalCuotas:    init.totalCuotas,
      originalAmount: init.originalAmount,
      monthlyPayment: init.monthlyPayment,
      monthlyCharges: init.monthlyCharges,
      balanceIsTotal: init.balanceIsTotal,
      remainingBalance: init.balanceIsTotal ? init.remainingBalance : s.remainingBalance,
      amountPaid:     s.amountPaid ?? 0,
      dueDay:         init.dueDay,
      startDate:      init.startDate,
    }
  })
  const missing = INITIAL_DEBTS.filter(
    init => !updated.some(s => s.name === init.name && s.bank === init.bank)
  )
  return missing.length > 0 ? [...updated, ...missing] : updated
}

export function useDebts() {
  const [debts,    setDebts]    = useState([])
  const [isLoaded, setIsLoaded] = useState(false)
  const readyRef = useRef(false)

  useEffect(() => {
    loadDebts().then(data => {
      setDebts(migrateDebts(data))
      readyRef.current = true
      setIsLoaded(true)
    })
  }, [])

  useEffect(() => {
    if (!readyRef.current) return
    saveData('debts', debts)
  }, [debts])

  const addDebt = useCallback((data) => {
    const totalDebt = Number(data.totalDebt)
    setDebts(prev => [
      ...prev,
      {
        id:               generateId(),
        name:             data.name.trim(),
        bank:             data.bank?.trim() || '',
        totalDebt,
        monthlyPayment:   Number(data.monthlyPayment) || 0,
        remainingBalance: totalDebt,
        createdAt:        new Date().toISOString(),
      },
    ])
  }, [])

  const deleteDebt = useCallback((id) => {
    setDebts(prev => prev.filter(d => d.id !== id))
  }, [])

  const applyDebtPayment = useCallback((name, bank, amount, undo = false) => {
    setDebts(prev => prev.map(d => {
      if (d.name !== name || d.bank !== bank) return d
      const tem     = Math.pow(1 + (d.tea || 0) / 100, 1 / 12) - 1
      const charges = d.monthlyCharges || 0
      let newBalance

      if (d.balanceIsTotal) {
        // Monto original y deuda se mantienen fijos; solo acumula lo pagado en cuotas
        return {
          ...d,
          amountPaid: Math.max(0, (d.amountPaid || 0) + (undo ? -amount : amount)),
          paidCuotas: Math.max(0, (d.paidCuotas || 0) + (undo ? -1 : 1)),
        }
      }

      if (undo) {
        newBalance = tem > 0
          ? (d.remainingBalance + amount - charges) / (1 + tem)
          : d.remainingBalance + amount
      } else {
        const interest = d.remainingBalance * tem
        const capital  = amount - interest - charges
        newBalance = Math.max(0, d.remainingBalance - capital)
      }

      return {
        ...d,
        remainingBalance: newBalance,
        paidCuotas: Math.max(0, (d.paidCuotas || 0) + (undo ? -1 : 1)),
      }
    }))
  }, [])

  const totalDeuda = debts.reduce((s, d) => s + d.remainingBalance, 0)

  return { debts, totalDeuda, isLoaded, addDebt, deleteDebt, applyDebtPayment }
}
