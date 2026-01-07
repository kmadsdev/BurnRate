import { describe, it, expect } from 'vitest'
import {
    generateId,
    calculateBalance,
    calculateTotalIncome,
    calculateTotalExpenses,
    getMonthlyAggregates,
    predictNext,
    getCategoryBreakdown,
    formatCurrency,
    incomeCategories,
    expenseCategories
} from '../utils/calculations'

describe('generateId', () => {
    it('should generate unique IDs', () => {
        const id1 = generateId()
        const id2 = generateId()
        expect(id1).not.toBe(id2)
    })

    it('should return a string', () => {
        expect(typeof generateId()).toBe('string')
    })
})

describe('calculateBalance', () => {
    it('should return 0 for empty transactions', () => {
        expect(calculateBalance([])).toBe(0)
    })

    it('should calculate positive balance correctly', () => {
        const transactions = [
            { type: 'income', amount: 1000 },
            { type: 'expense', amount: 300 },
        ]
        expect(calculateBalance(transactions)).toBe(700)
    })

    it('should calculate negative balance correctly', () => {
        const transactions = [
            { type: 'income', amount: 100 },
            { type: 'expense', amount: 300 },
        ]
        expect(calculateBalance(transactions)).toBe(-200)
    })
})

describe('calculateTotalIncome', () => {
    it('should return 0 for empty transactions', () => {
        expect(calculateTotalIncome([])).toBe(0)
    })

    it('should sum only income transactions', () => {
        const transactions = [
            { type: 'income', amount: 1000 },
            { type: 'expense', amount: 300 },
            { type: 'income', amount: 500 },
        ]
        expect(calculateTotalIncome(transactions)).toBe(1500)
    })
})

describe('calculateTotalExpenses', () => {
    it('should return 0 for empty transactions', () => {
        expect(calculateTotalExpenses([])).toBe(0)
    })

    it('should sum only expense transactions', () => {
        const transactions = [
            { type: 'income', amount: 1000 },
            { type: 'expense', amount: 300 },
            { type: 'expense', amount: 200 },
        ]
        expect(calculateTotalExpenses(transactions)).toBe(500)
    })
})

describe('getCategoryBreakdown', () => {
    it('should return empty array for no transactions', () => {
        expect(getCategoryBreakdown([], 'expense')).toEqual([])
    })

    it('should break down expenses by category', () => {
        const transactions = [
            { type: 'expense', amount: 100, category: 'Food' },
            { type: 'expense', amount: 200, category: 'Food' },
            { type: 'expense', amount: 100, category: 'Housing' },
        ]
        const breakdown = getCategoryBreakdown(transactions, 'expense')

        expect(breakdown.length).toBe(2)
        expect(breakdown.find(c => c.name === 'Food').value).toBe(75) // 75%
        expect(breakdown.find(c => c.name === 'Housing').value).toBe(25) // 25%
    })
})

describe('predictNext', () => {
    it('should return empty array for no data', () => {
        expect(predictNext([], 3)).toEqual([])
    })

    it('should return predictions based on average', () => {
        const monthlyData = [
            { income: 1000, expense: 500 },
            { income: 2000, expense: 600 },
            { income: 1500, expense: 400 },
        ]
        const predictions = predictNext(monthlyData, 3)

        expect(predictions.length).toBe(3)
        expect(predictions[0].predicted).toBe(true)
        // Average income: (1000+2000+1500)/3 = 1500
        expect(predictions[0].income).toBe(1500)
        // Average expense: (500+600+400)/3 = 500
        expect(predictions[0].expense).toBe(500)
    })
})

describe('formatCurrency', () => {
    it('should format currency with default symbol', () => {
        expect(formatCurrency(1234.56)).toBe('$1,234.56')
    })

    it('should handle zero', () => {
        expect(formatCurrency(0)).toBe('$0.00')
    })

    it('should format large numbers', () => {
        expect(formatCurrency(1000000)).toBe('$1,000,000.00')
    })
})

describe('categories', () => {
    it('should have income categories', () => {
        expect(incomeCategories.length).toBeGreaterThan(0)
        expect(incomeCategories).toContain('Salary')
    })

    it('should have expense categories', () => {
        expect(expenseCategories.length).toBeGreaterThan(0)
        expect(expenseCategories).toContain('Cloud Services')
    })
})
