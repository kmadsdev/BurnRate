import { createContext, useContext, useState, useEffect } from 'react'
import { generateId } from '../utils/calculations'

const DataContext = createContext()

const STORAGE_KEY = 'burnrate-transactions'

// Sample data for initial setup
const SAMPLE_DATA = [
    {
        id: generateId(),
        type: 'income',
        amount: 5000,
        category: 'Salary',
        frequency: 'monthly',
        customDays: null,
        date: '2026-01-01',
        description: 'Monthly salary'
    },
    {
        id: generateId(),
        type: 'income',
        amount: 1500,
        category: 'Freelance',
        frequency: 'once',
        customDays: null,
        date: '2026-01-05',
        description: 'Website project'
    },
    {
        id: generateId(),
        type: 'expense',
        amount: 450,
        category: 'Cloud Services',
        frequency: 'monthly',
        customDays: null,
        date: '2026-01-02',
        description: 'AWS monthly bill'
    },
    {
        id: generateId(),
        type: 'expense',
        amount: 120,
        category: 'Subscriptions',
        frequency: 'monthly',
        customDays: null,
        date: '2026-01-03',
        description: 'GitHub, Figma, etc'
    },
    {
        id: generateId(),
        type: 'expense',
        amount: 85,
        category: 'Tools',
        frequency: 'monthly',
        customDays: null,
        date: '2026-01-04',
        description: 'VSCode extensions, AI tools'
    },
    {
        id: generateId(),
        type: 'expense',
        amount: 800,
        category: 'Housing',
        frequency: 'monthly',
        customDays: null,
        date: '2026-01-05',
        description: 'Rent'
    },
    {
        id: generateId(),
        type: 'expense',
        amount: 300,
        category: 'Food',
        frequency: 'monthly',
        customDays: null,
        date: '2026-01-06',
        description: 'Groceries'
    },
    // Historical data for charts
    ...generateHistoricalData()
]

function generateHistoricalData() {
    const data = []
    const now = new Date()

    // Generate 6 months of historical data
    for (let m = 5; m >= 1; m--) {
        const date = new Date(now.getFullYear(), now.getMonth() - m, 15)
        const dateStr = date.toISOString().split('T')[0]

        // Income
        data.push({
            id: generateId(),
            type: 'income',
            amount: 4500 + Math.random() * 1500,
            category: 'Salary',
            frequency: 'monthly',
            customDays: null,
            date: dateStr,
            description: 'Monthly salary'
        })

        // Expenses
        data.push({
            id: generateId(),
            type: 'expense',
            amount: 300 + Math.random() * 200,
            category: 'Cloud Services',
            frequency: 'monthly',
            customDays: null,
            date: dateStr,
            description: 'Cloud bills'
        })

        data.push({
            id: generateId(),
            type: 'expense',
            amount: 100 + Math.random() * 100,
            category: 'Subscriptions',
            frequency: 'monthly',
            customDays: null,
            date: dateStr,
            description: 'Various subscriptions'
        })

        data.push({
            id: generateId(),
            type: 'expense',
            amount: 700 + Math.random() * 200,
            category: 'Housing',
            frequency: 'monthly',
            customDays: null,
            date: dateStr,
            description: 'Rent'
        })
    }

    return data
}

export function DataProvider({ children }) {
    const [transactions, setTransactions] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem(STORAGE_KEY)
            if (saved) {
                try {
                    return JSON.parse(saved)
                } catch (e) {
                    console.error('Failed to parse saved transactions:', e)
                }
            }
        }
        return SAMPLE_DATA
    })

    // Save to localStorage when transactions change
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions))
        }
    }, [transactions])

    // CRUD Operations
    const addTransaction = (transaction) => {
        const newTransaction = {
            ...transaction,
            id: generateId(),
        }
        setTransactions(prev => [...prev, newTransaction])
        return newTransaction
    }

    const updateTransaction = (id, updates) => {
        setTransactions(prev =>
            prev.map(t => t.id === id ? { ...t, ...updates } : t)
        )
    }

    const deleteTransaction = (id) => {
        setTransactions(prev => prev.filter(t => t.id !== id))
    }

    const getTransactionById = (id) => {
        return transactions.find(t => t.id === id)
    }

    // Filtered getters
    const getIncomeTransactions = () => {
        return transactions.filter(t => t.type === 'income')
    }

    const getExpenseTransactions = () => {
        return transactions.filter(t => t.type === 'expense')
    }

    // Clear all data
    const clearAllData = () => {
        setTransactions([])
        localStorage.removeItem(STORAGE_KEY)
    }

    // Reset to sample data
    const resetToSampleData = () => {
        setTransactions(SAMPLE_DATA)
    }

    const value = {
        transactions,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        getTransactionById,
        getIncomeTransactions,
        getExpenseTransactions,
        clearAllData,
        resetToSampleData,
    }

    return (
        <DataContext.Provider value={value}>
            {children}
        </DataContext.Provider>
    )
}

export function useData() {
    const context = useContext(DataContext)
    if (!context) {
        throw new Error('useData must be used within a DataProvider')
    }
    return context
}

export default DataContext
