import { useState, useEffect, useCallback, useRef } from 'react'
import { STORAGE_KEYS, INITIAL_SAVINGS } from '../utils/constants'
import { readStorage } from '../utils/storage'
import { generateId } from '../utils/formatters'
import { fetchData, saveData } from '../utils/api'

async function loadSavings() {
  const api = await fetchData('savings')
  if (api !== null) return api
  const local = readStorage(STORAGE_KEYS.SAVINGS, null)
  if (local !== null) { saveData('savings', local); return local }
  return INITIAL_SAVINGS
}

export function useSavings() {
  const [savings,  setSavings]  = useState([])
  const [isLoaded, setIsLoaded] = useState(false)
  const readyRef = useRef(false)

  useEffect(() => {
    loadSavings().then(data => {
      const missing = INITIAL_SAVINGS.filter(
        init => !data.some(s => s.name === init.name)
      )
      setSavings(missing.length > 0 ? [...data, ...missing] : data)
      readyRef.current = true
      setIsLoaded(true)
    })
  }, [])

  useEffect(() => {
    if (!readyRef.current) return
    saveData('savings', savings)
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
          { id: generateId(), amount, date: new Date().toISOString(), notes: data.notes?.trim() || '' },
        ],
      }
    }))
  }, [])

  const deleteSavingGoal = useCallback((id) => {
    setSavings(prev => prev.filter(g => g.id !== id))
  }, [])

  const totalAhorrado = savings.reduce((s, g) => s + g.currentAmount, 0)

  return { savings, totalAhorrado, isLoaded, addSavingGoal, addContribution, deleteSavingGoal }
}
