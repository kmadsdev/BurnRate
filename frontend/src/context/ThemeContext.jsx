import { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext()

const STORAGE_KEY = 'burnrate-theme'

export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState(() => {
        // Check localStorage first
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem(STORAGE_KEY)
            if (saved === 'dark' || saved === 'light') {
                return saved
            }
            // Fall back to system preference
            if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                return 'dark'
            }
        }
        return 'light'
    })

    // Apply theme to document
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const root = document.documentElement
            if (theme === 'dark') {
                root.classList.add('dark')
            } else {
                root.classList.remove('dark')
            }
            localStorage.setItem(STORAGE_KEY, theme)
        }
    }, [theme])

    const toggleTheme = () => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark')
    }

    const setLightMode = () => setTheme('light')
    const setDarkMode = () => setTheme('dark')

    const value = {
        theme,
        isDark: theme === 'dark',
        isLight: theme === 'light',
        toggleTheme,
        setLightMode,
        setDarkMode,
    }

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    )
}

export function useTheme() {
    const context = useContext(ThemeContext)
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider')
    }
    return context
}

export default ThemeContext
