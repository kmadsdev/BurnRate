import { NavLink } from 'react-router-dom'
import { useTheme } from '../../context/ThemeContext'

import DashboardIcon from '../../assets/icons/dashboard.svg?react'
import WalletIcon from '../../assets/icons/wallet.svg?react'
import AnalyticsIcon from '../../assets/icons/analytics.svg?react'
import CalendarIcon from '../../assets/icons/calendar.svg?react'
import SettingsIcon from '../../assets/icons/settings.svg?react'
import SunIcon from '../../assets/icons/sun.svg?react'
import MoonIcon from '../../assets/icons/moon.svg?react'
import Logo from '../../assets/icons/logo.svg?react'

const navItems = [
    { path: '/', icon: DashboardIcon, label: 'Dashboard' },
    { path: '/wallet', icon: WalletIcon, label: 'Transactions' },
    { path: '/analytics', icon: AnalyticsIcon, label: 'Analytics' },
    { path: '/calendar', icon: CalendarIcon, label: 'Calendar' },
    { path: '/settings', icon: SettingsIcon, label: 'Settings' },
]

function Sidebar() {
    const { theme, toggleTheme } = useTheme()

    return (
        <aside className="sidebar">
            <div className="sidebar-logo">
                <Logo />
            </div>

            <nav className="sidebar-nav">
                {navItems.map(({ path, icon: Icon, label }) => (
                    <NavLink
                        key={path}
                        to={path}
                        className={({ isActive }) =>
                            `sidebar-nav-item ${isActive ? 'active' : ''}`
                        }
                        title={label}
                    >
                        <Icon />
                        <span className="sr-only">{label}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="sidebar-footer">
                <button
                    className="sidebar-theme-toggle"
                    onClick={toggleTheme}
                    title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                    {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
                    <span className="sr-only">Toggle theme</span>
                </button>
            </div>
        </aside>
    )
}

export default Sidebar
