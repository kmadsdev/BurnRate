import { NavLink } from 'react-router-dom'
import { useTheme } from '../../context/ThemeContext'

// SVG Icons as components
const DashboardIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="9" rx="1" />
        <rect x="14" y="3" width="7" height="5" rx="1" />
        <rect x="14" y="12" width="7" height="9" rx="1" />
        <rect x="3" y="16" width="7" height="5" rx="1" />
    </svg>
)

const WalletIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 5h18a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z" />
        <path d="M1 10h22" />
        <path d="M16 15h2" />
    </svg>
)

const AnalyticsIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 3v18h18" />
        <path d="M18 17V9" />
        <path d="M13 17V5" />
        <path d="M8 17v-3" />
    </svg>
)

const CalendarIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
)

const SettingsIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
)

const SunIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="5" />
        <line x1="12" y1="1" x2="12" y2="3" />
        <line x1="12" y1="21" x2="12" y2="23" />
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
        <line x1="1" y1="12" x2="3" y2="12" />
        <line x1="21" y1="12" x2="23" y2="12" />
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
)

const MoonIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
)

const Logo = () => (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
        <rect width="40" height="40" rx="10" fill="#4169E1" />
        <path d="M12 28V12H18C19.5 12 20.7 12.4 21.6 13.2C22.5 14 23 15.1 23 16.5C23 17.3 22.8 18 22.4 18.6C22 19.2 21.5 19.6 20.8 19.9V20C21.6 20.2 22.3 20.7 22.8 21.4C23.3 22.1 23.6 22.9 23.6 23.9C23.6 25.3 23.1 26.4 22 27.2C20.9 28 19.5 28 17.8 28H12ZM15 25.5H17.5C18.4 25.5 19.1 25.3 19.5 24.9C19.9 24.5 20.1 24 20.1 23.4C20.1 22.8 19.9 22.3 19.5 21.9C19.1 21.5 18.5 21.3 17.7 21.3H15V25.5ZM15 18.8H17.3C18 18.8 18.5 18.6 18.9 18.3C19.3 18 19.5 17.5 19.5 16.9C19.5 16.3 19.3 15.8 18.9 15.5C18.5 15.2 17.9 15 17.2 15H15V18.8Z" fill="white" />
    </svg>
)

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
