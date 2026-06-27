import { AppProvider, useAppContext } from './context/AppContext'
import { useAuth }    from './hooks/useAuth'
import { BottomNav }  from './components/BottomNav'
import { Login }      from './pages/Login'
import { Home }       from './pages/Home'
import { Payments }   from './pages/Payments'
import { Debts }      from './pages/Debts'
import { Savings }    from './pages/Savings'
import { TABS }       from './utils/constants'

// Contenido principal de la app (requiere AppProvider para useAppContext)
function AppContent({ onLogout }) {
  const { activeTab } = useAppContext()

  return (
    <div className="min-h-dvh" style={{ backgroundColor: 'var(--color-canvas)' }}>
      {/* Área de contenido con padding inferior para el BottomNav */}
      <main className="max-w-lg mx-auto">
        {activeTab === TABS.HOME     && <Home onLogout={onLogout} />}
        {activeTab === TABS.PAYMENTS && <Payments />}
        {activeTab === TABS.DEBTS    && <Debts />}
        {activeTab === TABS.SAVINGS  && <Savings />}
      </main>

      {/* Navegación inferior fija */}
      <BottomNav />
    </div>
  )
}

// Componente raíz: gestiona autenticación antes de mostrar la app
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
