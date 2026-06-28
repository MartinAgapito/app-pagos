import { useState, useEffect, useCallback } from 'react'
import { STORAGE_KEYS, INITIAL_DEBTS } from '../utils/constants'
import { readStorage, writeStorage } from '../utils/storage'
import { generateId } from '../utils/formatters'

export function useDebts() {
  const [debts, setDebts] = useState(() => {
    const stored = readStorage(STORAGE_KEYS.DEBTS, null)
    if (stored === null) return INITIAL_DEBTS
    // Eliminar entradas que ya no pertenecen a préstamos
    const filtered = stored.filter(s =>
      !(s.name === 'Tarjeta'          && s.bank === 'Scotiabank') &&
      !(s.name === 'Préstamo Personal' && s.bank === 'Scotiabank')
    )
    // Actualizar solo campos de referencia — NO tocar remainingBalance ni paidCuotas
    // (esos los gestiona applyDebtPayment al registrar pagos)
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
        dueDay:         init.dueDay,
        startDate:      init.startDate,
      }
    })
    // Agregar deudas iniciales que falten
    const missing = INITIAL_DEBTS.filter(
      init => !updated.some(s => s.name === init.name && s.bank === init.bank)
    )
    return missing.length > 0 ? [...updated, ...missing] : updated
  })

  useEffect(() => { writeStorage(STORAGE_KEYS.DEBTS, debts) }, [debts])

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
      // Amortización francesa: solo baja al capital, no el total de la cuota
      const tem      = Math.pow(1 + (d.tea || 0) / 100, 1 / 12) - 1
      const charges  = d.monthlyCharges || 0
      let newBalance
      if (undo) {
        newBalance = tem > 0
          ? (d.remainingBalance + amount) / (1 + tem)
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

  return { debts, totalDeuda, addDebt, deleteDebt, applyDebtPayment }
}
