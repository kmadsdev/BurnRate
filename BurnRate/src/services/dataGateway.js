/**
 * Data Gateway API
 * 
 * Handles data export/import operations for BurnRate application.
 * Currently uses localStorage; designed to connect to a backend server later.
 */

import * as XLSX from 'xlsx'

// ==================== SCHEMA DEFINITIONS ====================

/**
 * Transaction schema for validation
 */
const TRANSACTION_SCHEMA = {
    id: 'string',
    type: { type: 'string', enum: ['income', 'expense'] },
    name: { type: 'string', nullable: true },
    company: { type: 'string', nullable: true },
    amount: 'number',
    category: 'string',
    frequency: { type: 'string', enum: ['once', 'weekly', 'monthly', 'yearly', 'custom'] },
    customDays: { type: 'number', nullable: true },
    date: 'string',
    description: { type: 'string', nullable: true }
}

/**
 * Goal schema for validation
 */
const GOAL_SCHEMA = {
    id: 'string',
    title: 'string',
    targetAmount: 'number',
    currentAmount: 'number',
    deadline: 'string',
    category: 'string',
    completed: 'boolean'
}

/**
 * Settings schema for validation
 */
const SETTINGS_SCHEMA = {
    currency: 'string'
}

// ==================== VALIDATION FUNCTIONS ====================

/**
 * Validates a single row against a schema
 * @param {Object} row - The data row to validate
 * @param {Object} schema - The schema to validate against
 * @param {number} rowIndex - Row index for error messages
 * @returns {string[]} Array of error messages
 */
function validateRow(row, schema, rowIndex) {
    const errors = []

    for (const [field, rules] of Object.entries(schema)) {
        const value = row[field]
        const isNullable = typeof rules === 'object' && rules.nullable
        const expectedType = typeof rules === 'string' ? rules : rules.type
        const enumValues = typeof rules === 'object' ? rules.enum : null

        // Check for required fields (unless nullable)
        if (value === undefined || value === null || value === '') {
            if (!isNullable) {
                errors.push(`Row ${rowIndex + 1}: Missing required field "${field}"`)
            }
            continue
        }

        // Type validation
        if (expectedType === 'number') {
            const numValue = Number(value)
            if (isNaN(numValue)) {
                errors.push(`Row ${rowIndex + 1}: Field "${field}" must be a number`)
            }
        } else if (expectedType === 'boolean') {
            const strValue = String(value).toLowerCase()
            if (!['true', 'false', '1', '0', 'yes', 'no'].includes(strValue)) {
                errors.push(`Row ${rowIndex + 1}: Field "${field}" must be a boolean`)
            }
        }

        // Enum validation
        if (enumValues && !enumValues.includes(value)) {
            errors.push(`Row ${rowIndex + 1}: Field "${field}" must be one of: ${enumValues.join(', ')}`)
        }
    }

    return errors
}

/**
 * Validates imported data structure
 * @param {Object} data - The imported data object
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateImportData(data) {
    const errors = []

    // Validate transactions
    if (data.transactions) {
        if (!Array.isArray(data.transactions)) {
            errors.push('Transactions must be an array')
        } else {
            data.transactions.forEach((row, idx) => {
                errors.push(...validateRow(row, TRANSACTION_SCHEMA, idx))
            })
        }
    }

    // Validate goals
    if (data.goals) {
        if (!Array.isArray(data.goals)) {
            errors.push('Goals must be an array')
        } else {
            data.goals.forEach((row, idx) => {
                errors.push(...validateRow(row, GOAL_SCHEMA, idx))
            })
        }
    }

    // Validate settings
    if (data.settings && typeof data.settings !== 'object') {
        errors.push('Settings must be an object')
    }

    return {
        valid: errors.length === 0,
        errors
    }
}

/**
 * Normalizes row data types after parsing
 * @param {Object} row - Raw row from file
 * @param {Object} schema - Schema to normalize against
 * @returns {Object} Normalized row
 */
function normalizeRow(row, schema) {
    const normalized = {}

    for (const [field, rules] of Object.entries(schema)) {
        const value = row[field]
        const expectedType = typeof rules === 'string' ? rules : rules.type
        const isNullable = typeof rules === 'object' && rules.nullable

        if (value === undefined || value === null || value === '') {
            normalized[field] = isNullable ? null : (expectedType === 'number' ? 0 : '')
            continue
        }

        switch (expectedType) {
            case 'number':
                normalized[field] = Number(value)
                break
            case 'boolean':
                const strValue = String(value).toLowerCase()
                normalized[field] = ['true', '1', 'yes'].includes(strValue)
                break
            default:
                normalized[field] = String(value)
        }
    }

    return normalized
}

// ==================== EXPORT FUNCTIONS ====================

/**
 * Exports data to a CSV file and triggers download
 * @param {Object} data - { transactions, goals, currency }
 */
export function exportToCSV(data) {
    const workbook = XLSX.utils.book_new()

    // Transactions sheet
    if (data.transactions && data.transactions.length > 0) {
        const transactionsSheet = XLSX.utils.json_to_sheet(data.transactions)
        XLSX.utils.book_append_sheet(workbook, transactionsSheet, 'transactions')
    }

    // Goals sheet
    if (data.goals && data.goals.length > 0) {
        const goalsSheet = XLSX.utils.json_to_sheet(data.goals)
        XLSX.utils.book_append_sheet(workbook, goalsSheet, 'goals')
    }

    // Settings sheet
    const settingsData = [{ key: 'currency', value: data.currency || '$' }]
    const settingsSheet = XLSX.utils.json_to_sheet(settingsData)
    XLSX.utils.book_append_sheet(workbook, settingsSheet, 'settings')

    // Generate and download
    const timestamp = new Date().toISOString().split('T')[0]
    XLSX.writeFile(workbook, `burnrate-export-${timestamp}.csv`, { bookType: 'csv' })
}

/**
 * Exports data to an XLSX file and triggers download
 * @param {Object} data - { transactions, goals, currency }
 */
export function exportToXLSX(data) {
    const workbook = XLSX.utils.book_new()

    // Transactions sheet
    if (data.transactions && data.transactions.length > 0) {
        const transactionsSheet = XLSX.utils.json_to_sheet(data.transactions)
        XLSX.utils.book_append_sheet(workbook, transactionsSheet, 'transactions')
    }

    // Goals sheet
    if (data.goals && data.goals.length > 0) {
        const goalsSheet = XLSX.utils.json_to_sheet(data.goals)
        XLSX.utils.book_append_sheet(workbook, goalsSheet, 'goals')
    }

    // Settings sheet
    const settingsData = [{ key: 'currency', value: data.currency || '$' }]
    const settingsSheet = XLSX.utils.json_to_sheet(settingsData)
    XLSX.utils.book_append_sheet(workbook, settingsSheet, 'settings')

    // Generate and download
    const timestamp = new Date().toISOString().split('T')[0]
    XLSX.writeFile(workbook, `burnrate-export-${timestamp}.xlsx`, { bookType: 'xlsx' })
}

// ==================== IMPORT FUNCTIONS ====================

/**
 * Imports data from a file (CSV or XLSX)
 * @param {File} file - The file to import
 * @returns {Promise<{ data: Object|null, errors: string[] }>}
 */
export async function importFromFile(file) {
    return new Promise((resolve) => {
        const reader = new FileReader()

        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result)
                const workbook = XLSX.read(data, { type: 'array' })

                const result = {
                    transactions: [],
                    goals: [],
                    currency: '$'
                }

                // Parse transactions sheet
                if (workbook.SheetNames.includes('transactions')) {
                    const sheet = workbook.Sheets['transactions']
                    const rawData = XLSX.utils.sheet_to_json(sheet)
                    result.transactions = rawData.map(row =>
                        normalizeRow(row, TRANSACTION_SCHEMA)
                    )
                }

                // Parse goals sheet
                if (workbook.SheetNames.includes('goals')) {
                    const sheet = workbook.Sheets['goals']
                    const rawData = XLSX.utils.sheet_to_json(sheet)
                    result.goals = rawData.map(row =>
                        normalizeRow(row, GOAL_SCHEMA)
                    )
                }

                // Parse settings sheet
                if (workbook.SheetNames.includes('settings')) {
                    const sheet = workbook.Sheets['settings']
                    const settingsData = XLSX.utils.sheet_to_json(sheet)
                    const currencySetting = settingsData.find(s => s.key === 'currency')
                    if (currencySetting) {
                        result.currency = currencySetting.value || '$'
                    }
                }

                // Validate the parsed data
                const validation = validateImportData(result)

                if (!validation.valid) {
                    resolve({ data: null, errors: validation.errors })
                    return
                }

                resolve({ data: result, errors: [] })

            } catch (error) {
                resolve({
                    data: null,
                    errors: [`Failed to parse file: ${error.message}`]
                })
            }
        }

        reader.onerror = () => {
            resolve({
                data: null,
                errors: ['Failed to read file']
            })
        }

        reader.readAsArrayBuffer(file)
    })
}

// ==================== STORAGE FUNCTIONS ====================
// These will be replaced with API calls when backend is ready

const STORAGE_KEYS = {
    transactions: 'burnrate-transactions',
    goals: 'burnrate-goals',
    currency: 'burnrate-currency',
    widgetConfig: 'burnrate-widget-config',
    widgetDefaults: 'burnrate-widget-defaults'
}

/**
 * Gets all exportable data from localStorage
 * @returns {Object} { transactions, goals, currency }
 */
export function getAllData() {
    const transactions = JSON.parse(localStorage.getItem(STORAGE_KEYS.transactions) || '[]')
    const goals = JSON.parse(localStorage.getItem(STORAGE_KEYS.goals) || '[]')
    const currency = localStorage.getItem(STORAGE_KEYS.currency) || '$'

    return { transactions, goals, currency }
}

/**
 * Saves all data to localStorage
 * @param {Object} data - { transactions, goals, currency }
 */
export function saveAllData(data) {
    if (data.transactions) {
        localStorage.setItem(STORAGE_KEYS.transactions, JSON.stringify(data.transactions))
    }
    if (data.goals) {
        localStorage.setItem(STORAGE_KEYS.goals, JSON.stringify(data.goals))
    }
    if (data.currency) {
        localStorage.setItem(STORAGE_KEYS.currency, data.currency)
    }
}

// ==================== GATEWAY API OBJECT ====================
// Main export for future backend integration

export const dataGateway = {
    // Export operations
    exportToCSV,
    exportToXLSX,

    // Import operations
    importFromFile,
    validateImportData,

    // Local storage operations (will become API calls)
    getAllData,
    saveAllData
}

export default dataGateway
