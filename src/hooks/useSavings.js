import { useState, useEffect, useCallback, useRef } from 'react'
import { STORAGE_KEYS, INITIAL_SAVINGS } from '../utils/constants'
import { readStorage, writeStorage } from '../utils/storage'
import { generateId } from '../utils/formatters'
import { fetchData, saveData } from '../utils/api'

export function useSavings() {
  const [savings, setSavings] = useState(() => {
    const stored = readStorage(STORAGE_KEYS.SAVINGS, null)
    if (stored === null || stored.length === 0) return INITIAL_SAVINGS
    const missing = INITIAL_SAVINGS.filter(
      init => !stored.some(s => s.name === init.name)
    )
    return missing.length > 0 ? [...stored, ...missing] : stored
  })

  const syncReadyRef = useRef(false)

  useEffect(() => {
    fetchData('savings').then(apiSavings => {
      if (apiSavings !== null) {
        setSavings(apiSavings)
        writeStorage(STORAGE_KEYS.SAVINGS, apiSavings)
      }
      syncReadyRef.current = true
    })
  }, [])

  useEffect(() => {
    writeStorage(STORAGE_KEYS.SAVINGS, savings)
    if (syncReadyRef.current) saveData('savings', savings)
  }, [savings])

  const addSavingGoal = useCallback((data) => {
    setSavings(prev => [
      ...prev,
      {
        id:            generateId(),
        name:          data.name.trim(),
        targetAmount:  Number(data.targetAmount),
        currentAmount: 0,
        contributions: [],
        createdAt:     new Date().toISOString(),
      },
    ])
  }, [])

  const addContribution = useCallback((goalId, data) => {
    const amount = Number(data.amount)
    setSavings(prev => prev.map(g => {
      if (g.id !== goalId) return g
      return {
        ...g,
        currentAmount: g.currentAmount + amount,
        contributions: [
          ...g.contributions,
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

  const deleteSavingGoal = useCallback((id) => {
    setSavings(prev => prev.filter(g => g.id !== id))
  }, [])

  const totalAhorrado = savings.reduce((s, g) => s + g.currentAmount, 0)

  return { savings, totalAhorrado, addSavingGoal, addContribution, deleteSavingGoal }
}
