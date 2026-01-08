import { useState, useMemo } from 'react'
import { useData } from '../context/DataContext'
import { formatCurrency } from '../utils/calculations'
import { getMonthCalendarData, getTransactionsForDate } from '../utils/recurrence'

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
]

// 10-year limit from today
const MAX_FUTURE_DATE = new Date()
MAX_FUTURE_DATE.setFullYear(MAX_FUTURE_DATE.getFullYear() + 10)

const ChevronLeft = () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M12 15l-5-5 5-5" />
    </svg>
)

const ChevronRight = () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M8 5l5 5-5 5" />
    </svg>
)

function Calendar() {
    const { transactions, currency } = useData()

    const today = new Date()
    const [currentYear, setCurrentYear] = useState(today.getFullYear())
    const [currentMonth, setCurrentMonth] = useState(today.getMonth())
    const [selectedDate, setSelectedDate] = useState(null)

    // Calculate calendar data
    const calendarData = useMemo(() => {
        return getMonthCalendarData(transactions, currentYear, currentMonth)
    }, [transactions, currentYear, currentMonth])

    // Get selected date transactions
    const selectedTransactions = useMemo(() => {
        if (!selectedDate) return []
        return getTransactionsForDate(transactions, selectedDate)
    }, [selectedDate, transactions])

    // Navigation with limits
    const canGoBack = () => {
        // Allow going back to any past date
        return true
    }

    const canGoForward = () => {
        const nextMonth = new Date(currentYear, currentMonth + 1, 1)
        return nextMonth <= MAX_FUTURE_DATE
    }

    const goToPreviousMonth = () => {
        if (currentMonth === 0) {
            setCurrentYear(currentYear - 1)
            setCurrentMonth(11)
        } else {
            setCurrentMonth(currentMonth - 1)
        }
    }

    const goToNextMonth = () => {
        if (!canGoForward()) return

        if (currentMonth === 11) {
            setCurrentYear(currentYear + 1)
            setCurrentMonth(0)
        } else {
            setCurrentMonth(currentMonth + 1)
        }
    }

    const goToToday = () => {
        setCurrentYear(today.getFullYear())
        setCurrentMonth(today.getMonth())
        setSelectedDate(today)
    }

    const handleDayClick = (day) => {
        if (day.transactions.length > 0 || day.isCurrentMonth) {
            setSelectedDate(day.date)
        }
    }

    // Calculate daily totals
    const getDayTotals = (dayTransactions) => {
        const income = dayTransactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0)
        const expense = dayTransactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0)
        return { income, expense }
    }

    return (
        <div className="page calendar-page">
            <header className="dashboard-header">
                <h1 className="dashboard-title">Calendar</h1>
            </header>

            <div className="calendar-container">
                {/* Calendar Header */}
                <div className="calendar-header">
                    <div className="calendar-nav">
                        <button
                            className="nav-btn"
                            onClick={goToPreviousMonth}
                            disabled={!canGoBack()}
                        >
                            <ChevronLeft />
                        </button>
                        <h2 className="calendar-title">
                            {MONTHS[currentMonth]} {currentYear}
                        </h2>
                        <button
                            className="nav-btn"
                            onClick={goToNextMonth}
                            disabled={!canGoForward()}
                        >
                            <ChevronRight />
                        </button>
                    </div>
                    <button className="btn btn-secondary today-btn" onClick={goToToday}>
                        Today
                    </button>
                </div>

                {/* Calendar Grid */}
                <div className="calendar-grid">
                    {/* Weekday Headers */}
                    <div className="weekday-row">
                        {WEEKDAYS.map(day => (
                            <div key={day} className="weekday-cell">{day}</div>
                        ))}
                    </div>

                    {/* Calendar Days */}
                    {calendarData.map((week, weekIdx) => (
                        <div key={weekIdx} className="week-row">
                            {week.map((day, dayIdx) => {
                                const totals = getDayTotals(day.transactions)
                                const hasTransactions = day.transactions.length > 0
                                const isSelected = selectedDate &&
                                    day.date.toDateString() === selectedDate.toDateString()

                                return (
                                    <div
                                        key={dayIdx}
                                        className={`day-cell ${!day.isCurrentMonth ? 'other-month' : ''
                                            } ${day.isToday ? 'today' : ''} ${isSelected ? 'selected' : ''
                                            } ${hasTransactions ? 'has-events' : ''}`}
                                        onClick={() => handleDayClick(day)}
                                    >
                                        <span className="day-number">{day.date.getDate()}</span>

                                        {hasTransactions && (
                                            <div className="day-events">
                                                {totals.income > 0 && (
                                                    <div className="event-indicator income">
                                                        +{formatCurrency(totals.income, currency)}
                                                    </div>
                                                )}
                                                {totals.expense > 0 && (
                                                    <div className="event-indicator expense">
                                                        -{formatCurrency(totals.expense, currency)}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    ))}
                </div>

                {/* Selected Day Details */}
                {selectedDate && (
                    <div className="day-details">
                        <h3>
                            {selectedDate.toLocaleDateString('en-US', {
                                weekday: 'long',
                                month: 'long',
                                day: 'numeric',
                                year: 'numeric'
                            })}
                        </h3>

                        {selectedTransactions.length === 0 ? (
                            <p className="no-events">No transactions on this day</p>
                        ) : (
                            <div className="transactions-list">
                                {selectedTransactions.map((t, idx) => (
                                    <div key={`${t.id}-${idx}`} className={`transaction-item ${t.type}`}>
                                        <div className="transaction-info">
                                            <span className="transaction-name">
                                                {t.name || t.description || t.category}
                                            </span>
                                            {t.company && (
                                                <span className="transaction-company">{t.company}</span>
                                            )}
                                            <span className="transaction-category">{t.category}</span>
                                            {t.frequency !== 'once' && (
                                                <span className="transaction-recurring">
                                                    🔄 {t.frequency}
                                                </span>
                                            )}
                                        </div>
                                        <span className={`transaction-amount ${t.type}`}>
                                            {t.type === 'income' ? '+' : '-'}
                                            {formatCurrency(t.amount, currency)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            <style>{`
                .calendar-page {
                    padding-bottom: 40px;
                }

                .calendar-container {
                    max-width: 1000px;
                }

                .calendar-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 24px;
                }

                .calendar-nav {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                }

                .calendar-title {
                    font-size: 24px;
                    font-weight: 600;
                    min-width: 200px;
                    text-align: center;
                    color: var(--text-primary);
                }

                .nav-btn {
                    width: 40px;
                    height: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: none;
                    background-color: var(--bg-card);
                    color: var(--text-primary);
                    border-radius: 10px;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .nav-btn:hover:not(:disabled) {
                    background-color: var(--bg-hover);
                }

                .nav-btn:disabled {
                    opacity: 0.3;
                    cursor: not-allowed;
                }

                .today-btn {
                    padding: 8px 16px;
                }

                .calendar-grid {
                    background-color: var(--bg-card);
                    border-radius: 16px;
                    overflow: hidden;
                }

                .weekday-row {
                    display: grid;
                    grid-template-columns: repeat(7, 1fr);
                    background-color: var(--bg-secondary);
                }

                .weekday-cell {
                    padding: 12px;
                    text-align: center;
                    font-weight: 600;
                    font-size: 13px;
                    color: var(--text-secondary);
                    text-transform: uppercase;
                }

                .week-row {
                    display: grid;
                    grid-template-columns: repeat(7, 1fr);
                    border-top: 1px solid var(--border-color, rgba(255,255,255,0.05));
                }

                .day-cell {
                    min-height: 100px;
                    padding: 8px;
                    border-right: 1px solid var(--border-color, rgba(255,255,255,0.05));
                    cursor: pointer;
                    transition: background-color 0.2s;
                }

                .day-cell:last-child {
                    border-right: none;
                }

                .day-cell:hover {
                    background-color: var(--bg-hover);
                }

                .day-cell.other-month {
                    opacity: 0.3;
                }

                .day-cell.today .day-number {
                    background-color: var(--accent-primary);
                    color: white;
                    border-radius: 50%;
                    width: 28px;
                    height: 28px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .day-cell.selected {
                    background-color: rgba(65, 105, 225, 0.1);
                }

                .day-number {
                    font-size: 14px;
                    font-weight: 500;
                    color: var(--text-primary);
                    margin-bottom: 4px;
                }

                .day-events {
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                    margin-top: 4px;
                }

                .event-indicator {
                    font-size: 10px;
                    padding: 2px 4px;
                    border-radius: 4px;
                    font-weight: 500;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .event-indicator.income {
                    background-color: rgba(97, 232, 19, 0.15);
                    color: var(--accent-green);
                }

                .event-indicator.expense {
                    background-color: rgba(255, 79, 121, 0.15);
                    color: var(--accent-red);
                }

                .day-details {
                    margin-top: 24px;
                    background-color: var(--bg-card);
                    border-radius: 16px;
                    padding: 20px;
                }

                .day-details h3 {
                    font-size: 18px;
                    font-weight: 600;
                    color: var(--text-primary);
                    margin-bottom: 16px;
                }

                .no-events {
                    color: var(--text-secondary);
                    font-style: italic;
                }

                .transactions-list {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .transaction-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 12px 16px;
                    background-color: var(--bg-primary);
                    border-radius: 10px;
                    border-left: 3px solid;
                }

                .transaction-item.income {
                    border-left-color: var(--accent-green);
                }

                .transaction-item.expense {
                    border-left-color: var(--accent-red);
                }

                .transaction-info {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }

                .transaction-name {
                    font-weight: 500;
                    color: var(--text-primary);
                }

                .transaction-company {
                    font-size: 13px;
                    color: var(--text-secondary);
                }

                .transaction-category {
                    font-size: 12px;
                    color: var(--text-secondary);
                    background-color: var(--bg-secondary);
                    padding: 2px 8px;
                    border-radius: 10px;
                    width: fit-content;
                }

                .transaction-recurring {
                    font-size: 12px;
                    color: var(--accent-primary);
                }

                .transaction-amount {
                    font-weight: 600;
                    font-size: 16px;
                }

                .transaction-amount.income {
                    color: var(--accent-green);
                }

                .transaction-amount.expense {
                    color: var(--accent-red);
                }

                @media (max-width: 768px) {
                    .day-cell {
                        min-height: 60px;
                        padding: 4px;
                    }

                    .event-indicator {
                        font-size: 8px;
                    }

                    .calendar-title {
                        font-size: 18px;
                        min-width: 150px;
                    }
                }
            `}</style>
        </div>
    )
}

export default Calendar
