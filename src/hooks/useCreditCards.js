import { useState, useEffect, useCallback, useRef } from 'react'
import { STORAGE_KEYS, INITIAL_CARDS } from '../utils/constants'
import { readStorage, writeStorage } from '../utils/storage'
import { generateId } from '../utils/formatters'
import { fetchData, saveData } from '../utils/api'

export function useCreditCards() {
  const [cards, setCards] = useState(() => {
    const stored = readStorage(STORAGE_KEYS.CARDS, null)
    if (stored === null) return INITIAL_CARDS
    const missing = INITIAL_CARDS.filter(
      init => !stored.some(s => s.name === init.name && s.bank === init.bank)
    )
    return missing.length > 0 ? [...stored, ...missing] : stored
  })

  const syncReadyRef = useRef(false)

  useEffect(() => {
    fetchData('cards').then(apiCards => {
      if (apiCards !== null) {
        setCards(apiCards)
        writeStorage(STORAGE_KEYS.CARDS, apiCards)
      }
      syncReadyRef.current = true
    })
  }, [])

  useEffect(() => {
    writeStorage(STORAGE_KEYS.CARDS, cards)
    if (syncReadyRef.current) saveData('cards', cards)
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

  return { cards, addMovement, deleteMovement, getCardBalance, totalTarjetas }
}
