import { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Lenis from 'lenis'
import { WidgetProvider } from './context/WidgetContext'
import { DataProvider } from './context/DataContext'
import { ThemeProvider } from './context/ThemeContext'
import Sidebar from './components/Layout/Sidebar'
import Dashboard from './pages/Dashboard'
import Wallet from './pages/Wallet'
import Analytics from './pages/Analytics'
import Calendar from './pages/Calendar'
import Settings from './pages/Settings'

function App() {
    useEffect(() => {
        // Initialize Lenis smooth scroll
        const lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            direction: 'vertical',
            gestureDirection: 'vertical',
            smooth: true,
            smoothTouch: false,
            touchMultiplier: 2,
        })

        function raf(time) {
            lenis.raf(time)
            requestAnimationFrame(raf)
        }

        requestAnimationFrame(raf)

        return () => {
            lenis.destroy()
        }
    }, [])

    return (
        <ThemeProvider>
            <DataProvider>
                <WidgetProvider>
                    <BrowserRouter>
                        <div className="app-layout">
                            <Sidebar />
                            <main className="main-content">
                                <Routes>
                                    <Route path="/" element={<Dashboard />} />
                                    <Route path="/wallet" element={<Wallet />} />
                                    <Route path="/analytics" element={<Analytics />} />
                                    <Route path="/calendar" element={<Calendar />} />
                                    <Route path="/settings" element={<Settings />} />
                                </Routes>
                            </main>
                        </div>
                    </BrowserRouter>
                </WidgetProvider>
            </DataProvider>
        </ThemeProvider>
    )
}

export default App
