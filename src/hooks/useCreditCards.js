import { useState, useEffect, useCallback, useRef } from 'react'
import { STORAGE_KEYS, INITIAL_CARDS } from '../utils/constants'
import { readStorage } from '../utils/storage'
import { generateId } from '../utils/formatters'
import { fetchData, saveData } from '../utils/api'

async function loadCards() {
  const api = await fetchData('cards')
  if (api !== null) return api
  const local = readStorage(STORAGE_KEYS.CARDS, null)
  if (local !== null) { saveData('cards', local); return local }
  return INITIAL_CARDS
}

export function useCreditCards() {
  const [cards,    setCards]    = useState([])
  const [isLoaded, setIsLoaded] = useState(false)
  const readyRef = useRef(false)

  useEffect(() => {
    loadCards().then(data => {
      const missing = INITIAL_CARDS.filter(
        init => !data.some(s => s.name === init.name && s.bank === init.bank)
      )
      setCards(missing.length > 0 ? [...data, ...missing] : data)
      readyRef.current = true
      setIsLoaded(true)
    })
  }, [])

  useEffect(() => {
    if (!readyRef.current) return
    saveData('cards', cards)
  }, [cards])

  const addMovement = useCallback((cardId, data) => {
    setCards(prev => prev.map(c => {
      if (c.id !== cardId) return c
      const movement = {
        id:          generateId(),
        description: data.description.trim(),
        amount:      Number(data.amount),
        type:        data.type,
        category:    data.category || 'Otros',
        date:        new Date().toISOString(),
      }
      return { ...c, movements: [movement, ...c.movements] }
    }))
  }, [])

  const deleteMovement = useCallback((cardId, movementId) => {
    setCards(prev => prev.map(c => {
      if (c.id !== cardId) return c
      return { ...c, movements: c.movements.filter(m => m.id !== movementId) }
    }))
  }, [])

  const getCardBalance = useCallback((card) =>
    card.movements.reduce(
      (bal, m) => m.type === 'gasto' ? bal + m.amount : bal - m.amount,
      card.initialBalance
    ),
  [])

  const totalTarjetas = cards.reduce((sum, c) => sum + getCardBalance(c), 0)

  return { cards, isLoaded, addMovement, deleteMovement, getCardBalance, totalTarjetas }
}
