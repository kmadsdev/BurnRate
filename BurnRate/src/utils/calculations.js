// Utility functions for calculations and predictions

/**
 * Generate a unique ID
 */
export function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

/**
 * Parse period string to number of days
 */
export function parsePeriodToDays(period) {
    const match = period.match(/(\d+)\s*(day|days|week|month|months|year)/i)
    if (!match) return 30 // default to 30 days

    const num = parseInt(match[1])
    const unit = match[2].toLowerCase()

    switch (unit) {
        case 'day':
        case 'days':
            return num
        case 'week':
            return num * 7
        case 'month':
        case 'months':
            return num * 30
        case 'year':
            return num * 365
        default:
            return 30
    }
}

/**
 * Filter transactions by period
 */
export function filterByPeriod(transactions, period) {
    const days = parsePeriodToDays(period)
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)

    return transactions.filter(t => {
        const tDate = new Date(t.date)
        return tDate >= cutoffDate
    })
}

/**
 * Calculate the total balance from transactions
 */
export function calculateBalance(transactions, period = null) {
    const filtered = period ? filterByPeriod(transactions, period) : transactions
    return filtered.reduce((balance, t) => {
        if (t.type === 'income') {
            return balance + t.amount
        } else {
            return balance - t.amount
        }
    }, 0)
}

/**
 * Calculate total income
 */
export function calculateTotalIncome(transactions, period = null) {
    const filtered = period ? filterByPeriod(transactions, period) : transactions
    return filtered
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0)
}

/**
 * Calculate total expenses
 */
export function calculateTotalExpenses(transactions, period = null) {
    const filtered = period ? filterByPeriod(transactions, period) : transactions
    return filtered
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0)
}

/**
 * Get monthly aggregates for the history chart
 */
export function getMonthlyAggregates(transactions, months = 12) {
    const now = new Date()
    const result = []

    for (let i = months - 1; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const monthStr = date.toLocaleString('en-US', { month: 'short' })
        const year = date.getFullYear()
        const month = date.getMonth()

        const monthTransactions = transactions.filter(t => {
            const tDate = new Date(t.date)
            return tDate.getFullYear() === year && tDate.getMonth() === month
        })

        const income = monthTransactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0)

        const expense = monthTransactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0)

        result.push({
            month: monthStr,
            year,
            income,
            expense,
            predicted: false
        })
    }

    return result
}

/**
 * Calculate predictions using min/max/avg
 */
export function predictNext(monthlyData, numMonths = 3) {
    if (monthlyData.length === 0) {
        return []
    }

    const incomeValues = monthlyData.map(m => m.income).filter(v => v > 0)
    const expenseValues = monthlyData.map(m => m.expense).filter(v => v > 0)

    // Calculate averages
    const avgIncome = incomeValues.length > 0
        ? incomeValues.reduce((a, b) => a + b, 0) / incomeValues.length
        : 0
    const avgExpense = expenseValues.length > 0
        ? expenseValues.reduce((a, b) => a + b, 0) / expenseValues.length
        : 0

    const predictions = []
    const lastMonth = monthlyData[monthlyData.length - 1]
    const now = new Date()

    for (let i = 1; i <= numMonths; i++) {
        const date = new Date(now.getFullYear(), now.getMonth() + i, 1)
        predictions.push({
            month: date.toLocaleString('en-US', { month: 'short' }),
            year: date.getFullYear(),
            income: Math.round(avgIncome),
            expense: Math.round(avgExpense),
            predicted: true
        })
    }

    return predictions
}

/**
 * Get category breakdown for activity chart
 */
export function getCategoryBreakdown(transactions, type = 'expense') {
    const filtered = transactions.filter(t => t.type === type)
    const categoryMap = {}

    filtered.forEach(t => {
        if (!categoryMap[t.category]) {
            categoryMap[t.category] = 0
        }
        categoryMap[t.category] += t.amount
    })

    const total = Object.values(categoryMap).reduce((a, b) => a + b, 0)

    const colors = {
        'Salary': '#4169E1',
        'Freelance': '#61E813',
        'Investments': '#FFBE0A',
        'Cloud Services': '#FF4F79',
        'Subscriptions': '#9B59B6',
        'Tools': '#3498DB',
        'Food': '#E74C3C',
        'Housing': '#1ABC9C',
        'Transportation': '#F39C12',
        'Entertainment': '#8E44AD',
        'Other': '#A7A8AB',
    }

    return Object.entries(categoryMap).map(([name, rawAmount]) => ({
        name,
        value: total > 0 ? Math.round((rawAmount / total) * 100) : 0,
        amount: rawAmount,
        color: colors[name] || '#A7A8AB'
    })).sort((a, b) => b.value - a.value)
}

/**
 * Get last N days of balance data for Balance widget
 */
export function getBalanceHistory(transactions, days = 7) {
    const result = []
    const now = new Date()

    for (let i = days - 1; i >= 0; i--) {
        const date = new Date(now)
        date.setDate(date.getDate() - i)
        const dayStr = date.toLocaleString('en-US', { weekday: 'short' })

        // Get transactions up to this day
        const transUpToDay = transactions.filter(t => {
            const tDate = new Date(t.date)
            return tDate <= date
        })

        const balance = calculateBalance(transUpToDay)

        result.push({
            day: dayStr,
            value: Math.max(0, balance),
            date: date.toISOString().split('T')[0]
        })
    }

    // Normalize to 0-100 for chart
    const maxValue = Math.max(...result.map(r => r.value), 1)
    return result.map(r => ({
        ...r,
        y: (r.value / maxValue) * 100
    }))
}

/**
 * Format currency
 */
export function formatCurrency(value, currency = '$') {
    return `${currency}${new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value)}`
}

/**
 * Get chart points for sparkline area charts (normalized 0-100)
 * Generates daily points for the given period
 */
export function getChartPoints(transactions, type, days = 7) {
    const result = []
    const now = new Date()

    // For longer periods (> 30 days), maybe we could group by week, 
    // but the request asks for "each day". Let's try daily for now.

    for (let i = days - 1; i >= 0; i--) {
        const date = new Date(now)
        date.setDate(date.getDate() - i)
        // Format label: "Jan 1"
        const label = date.toLocaleString('en-US', { month: 'short', day: 'numeric' })

        // Filter transactions for THIS DAY only (not cumulative)
        const dayTransactions = transactions.filter(t => {
            const tDate = new Date(t.date)
            return tDate.getDate() === date.getDate() &&
                tDate.getMonth() === date.getMonth() &&
                tDate.getFullYear() === date.getFullYear()
        })

        const value = dayTransactions
            .filter(t => t.type === type)
            .reduce((sum, t) => sum + t.amount, 0)

        result.push({
            label,
            value,
            date: date.toISOString().split('T')[0]
        })
    }

    const values = result.map(r => r.value)
    const maxValue = Math.max(...values, 1)

    return result.map((r, i) => ({
        x: (i / (result.length - 1)) * 100,
        y: (r.value / maxValue) * 100,
        ...r
    }))
}

/**
 * Default categories
 */
export const incomeCategories = [
    'Salary',
    'Freelance',
    'Investments',
    'Business',
    'Rental',
    'Other'
]

export const expenseCategories = [
    'Cloud Services',
    'Subscriptions',
    'Tools',
    'Food',
    'Housing',
    'Transportation',
    'Entertainment',
    'Utilities',
    'Healthcare',
    'Education',
    'Other'
]
