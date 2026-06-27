import { useState, useCallback } from 'react'
import { AUTH_CREDENTIALS, STORAGE_KEYS } from '../utils/constants'
import { readStorage, writeStorage } from '../utils/storage'

// Gestiona el estado de autenticación usando localStorage como sesión
export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const session = readStorage(STORAGE_KEYS.AUTH)
    return session?.loggedIn === true
  })

  // Valida credenciales y persiste la sesión en localStorage
  const login = useCallback((username, password) => {
    const valid =
      username.trim() === AUTH_CREDENTIALS.username &&
      password === AUTH_CREDENTIALS.password

    if (valid) {
      writeStorage(STORAGE_KEYS.AUTH, {
        loggedIn:  true,
        loginTime: new Date().toISOString(),
      })
      setIsAuthenticated(true)
    }
    return valid
  }, [])

  // Cierra sesión limpiando el flag de localStorage
  const logout = useCallback(() => {
    writeStorage(STORAGE_KEYS.AUTH, { loggedIn: false })
    setIsAuthenticated(false)
  }, [])

  return { isAuthenticated, login, logout }
}
