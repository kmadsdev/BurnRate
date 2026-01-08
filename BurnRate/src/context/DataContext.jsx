import { createContext, useContext, useState, useEffect } from 'react'
import { generateId } from '../utils/calculations'

const DataContext = createContext()

const STORAGE_KEY = 'burnrate-transactions'
const GOALS_STORAGE_KEY = 'burnrate-goals'
const CURRENCY_STORAGE_KEY = 'burnrate-currency'
const CATEGORIES_STORAGE_KEY = 'burnrate-categories'

// Default categories
const DEFAULT_CATEGORIES = {
    income: [
        { name: 'Salary', color: '#4169E1' },
        { name: 'Freelance', color: '#61E813' },
        { name: 'Investments', color: '#FFBE0A' },
        { name: 'Business', color: '#9B59B6' },
        { name: 'Rental', color: '#3498DB' },
        { name: 'Other', color: '#A7A8AB' }
    ],
    expense: [
        { name: 'Cloud Services', color: '#FF4F79' },
        { name: 'Subscriptions', color: '#9B59B6' },
        { name: 'Tools', color: '#3498DB' },
        { name: 'Food', color: '#E74C3C' },
        { name: 'Housing', color: '#1ABC9C' },
        { name: 'Transportation', color: '#F39C12' },
        { name: 'Entertainment', color: '#8E44AD' },
        { name: 'Utilities', color: '#27AE60' },
        { name: 'Healthcare', color: '#E67E22' },
        { name: 'Education', color: '#2980B9' },
        { name: 'Other', color: '#A7A8AB' }
    ]
}

// Sample data for initial setup
const SAMPLE_DATA = [
    {
        id: generateId(),
        type: 'income',
        name: 'Monthly Salary',
        company: 'TechCorp Inc.',
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
        name: 'Website Project',
        company: 'Freelance Client',
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
        name: 'AWS Monthly',
        company: 'Amazon Web Services',
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
        name: 'Dev Tools Bundle',
        company: 'Various',
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
        name: 'IDE & AI Tools',
        company: 'Various',
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
        name: 'Apartment Rent',
        company: 'Property Management',
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
        name: 'Groceries',
        company: 'Supermarket',
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

// Sample goals data
const SAMPLE_GOALS = [
    {
        id: generateId(),
        title: 'Emergency Fund',
        targetAmount: 10000,
        currentAmount: 2500,
        deadline: '2026-12-31',
        category: 'Savings',
        completed: false
    },
    {
        id: generateId(),
        title: 'New Laptop',
        targetAmount: 2000,
        currentAmount: 800,
        deadline: '2026-06-30',
        category: 'Purchase',
        completed: false
    }
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
            name: 'Monthly Salary',
            company: 'TechCorp Inc.',
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
            name: 'Cloud Services',
            company: 'AWS',
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
            name: 'Subscriptions',
            company: 'Various',
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
            name: 'Monthly Rent',
            company: 'Property Management',
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

    const [goals, setGoals] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem(GOALS_STORAGE_KEY)
            if (saved) {
                try {
                    return JSON.parse(saved)
                } catch (e) {
                    console.error('Failed to parse saved goals:', e)
                }
            }
        }
        return SAMPLE_GOALS
    })

    const [currency, setCurrency] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem(CURRENCY_STORAGE_KEY)
            if (saved) return saved
        }
        return '$'
    })

    const [categories, setCategories] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem(CATEGORIES_STORAGE_KEY)
            if (saved) {
                try {
                    return JSON.parse(saved)
                } catch (e) {
                    console.error('Failed to parse saved categories:', e)
                }
            }
        }
        return DEFAULT_CATEGORIES
    })

    // Save to localStorage when transactions change
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions))
        }
    }, [transactions])

    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem(GOALS_STORAGE_KEY, JSON.stringify(goals))
        }
    }, [goals])

    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem(CURRENCY_STORAGE_KEY, currency)
        }
    }, [currency])

    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(categories))
        }
    }, [categories])

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

    // Goals CRUD
    const addGoal = (goal) => {
        const newGoal = {
            ...goal,
            id: generateId(),
            currentAmount: Number(goal.currentAmount) || 0,
            targetAmount: Number(goal.targetAmount) || 0,
            completed: false
        }
        setGoals(prev => [...prev, newGoal])
        return newGoal
    }

    const updateGoal = (id, updates) => {
        setGoals(prev =>
            prev.map(g => g.id === id ? { ...g, ...updates } : g)
        )
    }

    const deleteGoal = (id) => {
        setGoals(prev => prev.filter(g => g.id !== id))
    }

    const toggleGoalCompletion = (id) => {
        setGoals(prev =>
            prev.map(g => g.id === id ? { ...g, completed: !g.completed } : g)
        )
    }

    // Clear all data
    const clearAllData = () => {
        setTransactions([])
        setGoals([])
        localStorage.removeItem(STORAGE_KEY)
        localStorage.removeItem(GOALS_STORAGE_KEY)
        localStorage.removeItem(CURRENCY_STORAGE_KEY)
        setCurrency('$')
        // Reset to sample data
    }

    // Reset to sample data
    const resetToSampleData = () => {
        setTransactions(SAMPLE_DATA)
        setGoals(SAMPLE_GOALS)
    }

    // Export all data for backup
    const exportData = () => {
        return {
            transactions,
            goals,
            currency
        }
    }

    // Import data from backup (replaces existing data)
    const importData = (data) => {
        if (data.transactions && Array.isArray(data.transactions)) {
            setTransactions(data.transactions)
        }
        if (data.goals && Array.isArray(data.goals)) {
            setGoals(data.goals)
        }
        if (data.currency) {
            setCurrency(data.currency)
        }
        if (data.categories) {
            setCategories(data.categories)
        }
    }

    // Category CRUD operations
    const addCategory = (type, category) => {
        setCategories(prev => ({
            ...prev,
            [type]: [...(prev[type] || []), category]
        }))
    }

    const updateCategory = (type, oldName, updates) => {
        setCategories(prev => ({
            ...prev,
            [type]: prev[type].map(cat =>
                (typeof cat === 'string' ? cat : cat.name) === oldName
                    ? { name: updates.name, color: updates.color }
                    : cat
            )
        }))
        // Also update transactions that use this category
        if (oldName !== updates.name) {
            setTransactions(prev =>
                prev.map(t =>
                    t.category === oldName && t.type === type
                        ? { ...t, category: updates.name }
                        : t
                )
            )
        }
    }

    const deleteCategory = (type, categoryName) => {
        setCategories(prev => ({
            ...prev,
            [type]: prev[type].filter(cat =>
                (typeof cat === 'string' ? cat : cat.name) !== categoryName
            )
        }))
    }

    // Get category names for forms (backwards compatible)
    const getCategoryNames = (type) => {
        return (categories[type] || []).map(cat =>
            typeof cat === 'string' ? cat : cat.name
        )
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
        exportData,
        importData,
        goals,
        addGoal,
        updateGoal,
        deleteGoal,
        toggleGoalCompletion,
        currency,
        setCurrency,
        categories,
        addCategory,
        updateCategory,
        deleteCategory,
        getCategoryNames
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
