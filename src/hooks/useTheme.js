import { useState } from 'react'

const THEME_KEY = 'app_pagos_theme'

// Aplica data-theme en <html> y color-scheme; persiste en localStorage
const applyTheme = (theme) => {
  document.documentElement.setAttribute('data-theme', theme)
  document.documentElement.style.colorScheme = theme
  localStorage.setItem(THEME_KEY, theme)
}

// Sincrónico: lee localStorage antes del primer render para evitar flash
const getInitialTheme = () => {
  const saved = localStorage.getItem(THEME_KEY)
  const theme = saved === 'light' ? 'light' : 'dark'
  applyTheme(theme)
  return theme
}

export function useTheme() {
  const [theme, setTheme] = useState(getInitialTheme)

  const toggleTheme = () => {
    setTheme(prev => {
      const next = prev === 'dark' ? 'light' : 'dark'
      applyTheme(next)
      return next
    })
  }

  return { theme, toggleTheme, isDark: theme === 'dark' }
}
