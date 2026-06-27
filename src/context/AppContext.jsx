import { createContext, useContext, useState } from 'react'
import { TABS } from '../utils/constants'
import { usePayments } from '../hooks/usePayments'
import { useDebts }    from '../hooks/useDebts'
import { useSavings }  from '../hooks/useSavings'

const AppContext = createContext(null)

// Proveedor global que centraliza todo el estado de la app
export function AppProvider({ children }) {
  const [activeTab, setActiveTab] = useState(TABS.HOME)

  const paymentsData = usePayments()
  const debtsData    = useDebts()
  const savingsData  = useSavings()

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        ...paymentsData,
        ...debtsData,
        ...savingsData,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

// Hook de acceso al contexto — lanza error si se usa fuera del Provider
export function useAppContext() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useAppContext debe usarse dentro de <AppProvider>')
  return ctx
}
