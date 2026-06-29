import { AppProvider, useAppContext } from './context/AppContext'
import { useAuth }     from './hooks/useAuth'
import { BottomNav }   from './components/BottomNav'
import { Login }       from './pages/Login'
import { Home }        from './pages/Home'
import { Payments }    from './pages/Payments'
import { Debts }       from './pages/Debts'
import { Savings }     from './pages/Savings'
import { Movements }   from './pages/Movements'
import { TABS }        from './utils/constants'

function LoadingScreen() {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center gap-4"
      style={{ backgroundColor: 'var(--color-canvas)' }}>
      <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
        style={{ borderColor: 'var(--color-positive)', borderTopColor: 'transparent' }} />
      <p className="text-sm text-dim">Cargando datos...</p>
    </div>
  )
}

function AppContent({ onLogout }) {
  const { activeTab, isLoading } = useAppContext()

  if (isLoading) return <LoadingScreen />

  return (
    <div className="min-h-dvh" style={{ backgroundColor: 'var(--color-canvas)' }}>
      <main className="max-w-lg mx-auto">
        {activeTab === TABS.HOME      && <Home onLogout={onLogout} />}
        {activeTab === TABS.PAYMENTS  && <Payments />}
        {activeTab === TABS.DEBTS     && <Debts />}
        {activeTab === TABS.SAVINGS   && <Savings />}
        {activeTab === TABS.MOVEMENTS && <Movements />}
      </main>
      <BottomNav />
    </div>
  )
}

export default function App() {
  const { isAuthenticated, login, logout } = useAuth()

  if (!isAuthenticated) {
    return <Login onLogin={login} />
  }

  return (
    <AppProvider>
      <AppContent onLogout={logout} />
    </AppProvider>
  )
}
