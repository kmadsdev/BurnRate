// Utility functions for calculations and predictions

/**
 * Generate a unique ID
 */
export function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

/**
 * Calculate the total balance from transactions
 */
export function calculateBalance(transactions) {
    return transactions.reduce((balance, t) => {
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
export function calculateTotalIncome(transactions) {
    return transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0)
}

/**
 * Calculate total expenses
 */
export function calculateTotalExpenses(transactions) {
    return transactions
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

    return Object.entries(categoryMap).map(([name, value]) => ({
        name,
        value: total > 0 ? Math.round((value / total) * 100) : 0,
        amount: value,
        color: colors[name] || '#A7A8AB'
    }))
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
        value: Math.round((r.value / maxValue) * 100)
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
 * Get chart points for area charts (normalized 0-100)
 */
export function getChartPoints(transactions, type, months = 6) {
    const aggregates = getMonthlyAggregates(transactions, months)
    const values = aggregates.map(a => type === 'income' ? a.income : a.expense)
    const maxValue = Math.max(...values, 1)

    return values.map((v, i) => ({
        x: (i / (values.length - 1)) * 100,
        y: (v / maxValue) * 100
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
