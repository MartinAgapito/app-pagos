import { createContext, useContext, useState } from 'react'
import { TABS } from '../utils/constants'

// Mapa directo: nombre del pago → deuda vinculada
const DEBT_LINKS = {
  'Hipotecario · BCP':            { name: 'Hipotecario',     bank: 'BCP'       },
  'Extralinea Auto · Scotiabank': { name: 'Extralinea Auto', bank: 'Scotiabank' },
  'Terreno · Interbank':          { name: 'Terreno',         bank: 'Interbank'  },
}
import { usePayments }     from '../hooks/usePayments'
import { useDebts }        from '../hooks/useDebts'
import { useSavings }      from '../hooks/useSavings'
import { useCreditCards }  from '../hooks/useCreditCards'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [activeTab, setActiveTab] = useState(TABS.HOME)

  const paymentsData = usePayments()
  const debtsData    = useDebts()
  const savingsData  = useSavings()
  const cardsData    = useCreditCards()

  // togglePaid sincronizado: al pagar una cuota también actualiza la deuda vinculada
  const togglePaid = (id, paidAmount) => {
    const payment = paymentsData.payments.find(p => p.id === id)
    if (!payment) return
    const marking = !payment.paid
    paymentsData.togglePaid(id, paidAmount)
    const linkedDebt = DEBT_LINKS[payment.name]
    if (linkedDebt) {
      const amount = marking
        ? (paidAmount ?? payment.amount)
        : (payment.paidAmount ?? payment.amount)
      debtsData.applyDebtPayment(linkedDebt.name, linkedDebt.bank, amount, !marking)
    }
  }

  const isLoading = !paymentsData.isLoaded || !debtsData.isLoaded ||
                    !savingsData.isLoaded  || !cardsData.isLoaded

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        isLoading,
        ...paymentsData,
        ...debtsData,
        ...savingsData,
        ...cardsData,
        togglePaid,
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
