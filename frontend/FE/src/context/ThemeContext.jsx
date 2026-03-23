import { createContext, useState, useEffect } from 'react'

export const ThemeContext = createContext()

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    // Récupérer le thème sauvegardé ou utiliser 'dark' par défaut
    const saved = localStorage.getItem('theme')
    return saved || 'dark'
  })

  useEffect(() => {
    // Sauvegarder le thème dans localStorage
    localStorage.setItem('theme', theme)
    
    // Appliquer le thème au document
    const html = document.documentElement
    if (theme === 'light') {
      html.classList.add('light-mode')
      html.classList.remove('dark-mode')
    } else {
      html.classList.add('dark-mode')
      html.classList.remove('light-mode')
    }
  }, [theme])

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark')
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}
