/**
 * Recurrence Utility Functions
 * 
 * Generates occurrences of recurring transactions for calendar display
 * and prediction calculations.
 */

/**
 * Parse a YYYY-MM-DD date string as local time, not UTC.
 * This fixes the off-by-one-day bug for timezones west of UTC.
 * @param {string} dateStr - Date string in YYYY-MM-DD format
 * @returns {Date} Date object in local time
 */
function parseLocalDate(dateStr) {
    const [year, month, day] = dateStr.split('-').map(Number)
    return new Date(year, month - 1, day)
}

/**
 * Calculate the next occurrence date based on frequency
 * @param {Date} fromDate - Starting date
 * @param {string} frequency - 'weekly', 'monthly', 'yearly', 'custom'
 * @param {number} customDays - Number of days for custom frequency
 * @returns {Date} Next occurrence date
 */
export function getNextOccurrence(fromDate, frequency, customDays = null) {
    const next = new Date(fromDate)

    switch (frequency) {
        case 'weekly':
            next.setDate(next.getDate() + 7)
            break
        case 'monthly':
            next.setMonth(next.getMonth() + 1)
            break
        case 'yearly':
            next.setFullYear(next.getFullYear() + 1)
            break
        case 'custom':
            if (customDays && customDays > 0) {
                next.setDate(next.getDate() + customDays)
            }
            break
        default:
            return null // 'once' doesn't recur
    }

    return next
}

/**
 * Generate all occurrences of a recurring transaction within a date range
 * @param {Object} transaction - The base transaction
 * @param {Date} startDate - Range start (inclusive)
 * @param {Date} endDate - Range end (inclusive)
 * @returns {Array} Array of occurrence objects with dates
 */
export function getRecurringOccurrences(transaction, startDate, endDate) {
    if (transaction.frequency === 'once') {
        // One-time transactions - just check if in range
        const transDate = parseLocalDate(transaction.date)
        if (transDate >= startDate && transDate <= endDate) {
            return [{
                ...transaction,
                occurrenceDate: transDate,
                isOriginal: true
            }]
        }
        return []
    }

    const occurrences = []
    let currentDate = parseLocalDate(transaction.date)

    // Skip to first occurrence on or after startDate
    while (currentDate < startDate) {
        const next = getNextOccurrence(currentDate, transaction.frequency, transaction.customDays)
        if (!next) break
        currentDate = next
    }

    // Generate occurrences within range
    while (currentDate <= endDate) {
        occurrences.push({
            ...transaction,
            occurrenceDate: new Date(currentDate),
            isOriginal: currentDate.toISOString().split('T')[0] === transaction.date
        })

        const next = getNextOccurrence(currentDate, transaction.frequency, transaction.customDays)
        if (!next) break
        currentDate = next
    }

    return occurrences
}

/**
 * Get all transactions (including generated occurrences) for a date range
 * @param {Array} transactions - Base transactions array
 * @param {Date} startDate - Range start
 * @param {Date} endDate - Range end  
 * @returns {Array} Expanded array with all occurrences
 */
export function getExpandedTransactions(transactions, startDate, endDate) {
    const allOccurrences = []

    for (const transaction of transactions) {
        const occurrences = getRecurringOccurrences(transaction, startDate, endDate)
        allOccurrences.push(...occurrences)
    }

    // Sort by occurrence date
    return allOccurrences.sort((a, b) =>
        new Date(a.occurrenceDate) - new Date(b.occurrenceDate)
    )
}

/**
 * Get transactions for a specific date
 * @param {Array} transactions - Base transactions array
 * @param {Date} date - The specific date
 * @returns {Array} Transactions occurring on that date
 */
export function getTransactionsForDate(transactions, date) {
    const targetDate = new Date(date)
    targetDate.setHours(0, 0, 0, 0)

    const nextDay = new Date(targetDate)
    nextDay.setDate(nextDay.getDate() + 1)

    return getExpandedTransactions(transactions, targetDate, nextDay).filter(t => {
        const occDate = new Date(t.occurrenceDate)
        occDate.setHours(0, 0, 0, 0)
        return occDate.getTime() === targetDate.getTime()
    })
}

/**
 * Calculate total recurring amount for a period (subscriptions total)
 * @param {Array} transactions - Base transactions array  
 * @param {string} type - 'income' or 'expense'
 * @param {Date} startDate - Period start
 * @param {Date} endDate - Period end
 * @returns {number} Total amount from recurring transactions
 */
export function calculateRecurringTotal(transactions, type, startDate, endDate) {
    const recurring = transactions.filter(t =>
        t.type === type && t.frequency !== 'once'
    )

    const occurrences = getExpandedTransactions(recurring, startDate, endDate)
    return occurrences.reduce((sum, t) => sum + t.amount, 0)
}

/**
 * Calculate total one-time amount for a period
 * @param {Array} transactions - Base transactions array
 * @param {string} type - 'income' or 'expense'
 * @param {Date} startDate - Period start
 * @param {Date} endDate - Period end
 * @returns {number} Total amount from one-time transactions
 */
export function calculateOneTimeTotal(transactions, type, startDate, endDate) {
    return transactions
        .filter(t => t.type === type && t.frequency === 'once')
        .filter(t => {
            const date = parseLocalDate(t.date)
            return date >= startDate && date <= endDate
        })
        .reduce((sum, t) => sum + t.amount, 0)
}

/**
 * Get month view data with all transactions for each day
 * @param {Array} transactions - Base transactions array
 * @param {number} year - Year to display
 * @param {number} month - Month to display (0-11)
 * @returns {Array} Array of week arrays, each containing day objects
 */
export function getMonthCalendarData(transactions, year, month) {
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)

    // Extend range to include padding days
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())

    const endDate = new Date(lastDay)
    endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()))

    // Get all occurrences for the visible range
    const allOccurrences = getExpandedTransactions(transactions, startDate, endDate)

    // Build calendar grid
    const weeks = []
    let currentDate = new Date(startDate)

    while (currentDate <= endDate) {
        const week = []

        for (let i = 0; i < 7; i++) {
            const dayDate = new Date(currentDate)
            const dayTransactions = allOccurrences.filter(t => {
                const occDate = new Date(t.occurrenceDate)
                return occDate.toDateString() === dayDate.toDateString()
            })

            week.push({
                date: new Date(dayDate),
                isCurrentMonth: dayDate.getMonth() === month,
                isToday: dayDate.toDateString() === new Date().toDateString(),
                transactions: dayTransactions
            })

            currentDate.setDate(currentDate.getDate() + 1)
        }

        weeks.push(week)
    }

    return weeks
}

export default {
    getNextOccurrence,
    getRecurringOccurrences,
    getExpandedTransactions,
    getTransactionsForDate,
    calculateRecurringTotal,
    calculateOneTimeTotal,
    getMonthCalendarData
}
