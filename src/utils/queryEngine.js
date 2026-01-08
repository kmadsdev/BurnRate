/**
 * Query Engine - SQL-like query parser and executor for BurnRate data
 * 
 * Supports a subset of SQL: SELECT, FROM, WHERE, GROUP BY, ORDER BY, LIMIT
 * Operates on in-memory arrays (transactions, goals)
 */

// ==================== TOKENIZER ====================

const TOKEN_TYPES = {
    KEYWORD: 'KEYWORD',
    IDENTIFIER: 'IDENTIFIER',
    OPERATOR: 'OPERATOR',
    STRING: 'STRING',
    NUMBER: 'NUMBER',
    COMMA: 'COMMA',
    STAR: 'STAR',
    LPAREN: 'LPAREN',
    RPAREN: 'RPAREN',
    EOF: 'EOF'
}

const KEYWORDS = [
    'SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'NOT',
    'GROUP', 'BY', 'ORDER', 'ASC', 'DESC', 'LIMIT',
    'AS', 'DISTINCT', 'HAVING', 'IN', 'LIKE', 'BETWEEN',
    'NULL', 'IS', 'TRUE', 'FALSE'
]

const AGGREGATE_FUNCTIONS = ['SUM', 'AVG', 'COUNT', 'MIN', 'MAX']

function tokenize(sql) {
    const tokens = []
    let i = 0
    const input = sql.trim()

    while (i < input.length) {
        // Skip whitespace
        if (/\s/.test(input[i])) {
            i++
            continue
        }

        // String literals
        if (input[i] === "'" || input[i] === '"') {
            const quote = input[i]
            i++
            let value = ''
            while (i < input.length && input[i] !== quote) {
                value += input[i]
                i++
            }
            i++ // skip closing quote
            tokens.push({ type: TOKEN_TYPES.STRING, value })
            continue
        }

        // Numbers
        if (/\d/.test(input[i]) || (input[i] === '-' && /\d/.test(input[i + 1]))) {
            let value = ''
            if (input[i] === '-') {
                value = '-'
                i++
            }
            while (i < input.length && /[\d.]/.test(input[i])) {
                value += input[i]
                i++
            }
            tokens.push({ type: TOKEN_TYPES.NUMBER, value: parseFloat(value) })
            continue
        }

        // Identifiers and keywords
        if (/[a-zA-Z_]/.test(input[i])) {
            let value = ''
            while (i < input.length && /[a-zA-Z0-9_]/.test(input[i])) {
                value += input[i]
                i++
            }
            const upper = value.toUpperCase()
            if (KEYWORDS.includes(upper) || AGGREGATE_FUNCTIONS.includes(upper)) {
                tokens.push({ type: TOKEN_TYPES.KEYWORD, value: upper })
            } else {
                tokens.push({ type: TOKEN_TYPES.IDENTIFIER, value })
            }
            continue
        }

        // Operators
        if (input.slice(i, i + 2) === '>=') {
            tokens.push({ type: TOKEN_TYPES.OPERATOR, value: '>=' })
            i += 2
            continue
        }
        if (input.slice(i, i + 2) === '<=') {
            tokens.push({ type: TOKEN_TYPES.OPERATOR, value: '<=' })
            i += 2
            continue
        }
        if (input.slice(i, i + 2) === '!=') {
            tokens.push({ type: TOKEN_TYPES.OPERATOR, value: '!=' })
            i += 2
            continue
        }
        if (input.slice(i, i + 2) === '<>') {
            tokens.push({ type: TOKEN_TYPES.OPERATOR, value: '!=' })
            i += 2
            continue
        }
        if (['=', '<', '>'].includes(input[i])) {
            tokens.push({ type: TOKEN_TYPES.OPERATOR, value: input[i] })
            i++
            continue
        }

        // Single chars
        if (input[i] === '*') {
            tokens.push({ type: TOKEN_TYPES.STAR, value: '*' })
            i++
            continue
        }
        if (input[i] === ',') {
            tokens.push({ type: TOKEN_TYPES.COMMA, value: ',' })
            i++
            continue
        }
        if (input[i] === '(') {
            tokens.push({ type: TOKEN_TYPES.LPAREN, value: '(' })
            i++
            continue
        }
        if (input[i] === ')') {
            tokens.push({ type: TOKEN_TYPES.RPAREN, value: ')' })
            i++
            continue
        }

        // Unknown char - skip
        i++
    }

    tokens.push({ type: TOKEN_TYPES.EOF, value: null })
    return tokens
}

// ==================== PARSER ====================

class Parser {
    constructor(tokens) {
        this.tokens = tokens
        this.pos = 0
    }

    current() {
        return this.tokens[this.pos]
    }

    peek(offset = 0) {
        return this.tokens[this.pos + offset]
    }

    consume(expectedType = null, expectedValue = null) {
        const token = this.current()
        if (expectedType && token.type !== expectedType) {
            throw new Error(`Expected ${expectedType} but got ${token.type}`)
        }
        if (expectedValue && token.value !== expectedValue) {
            throw new Error(`Expected ${expectedValue} but got ${token.value}`)
        }
        this.pos++
        return token
    }

    match(type, value = null) {
        const t = this.current()
        if (t.type === type && (value === null || t.value === value)) {
            this.pos++
            return true
        }
        return false
    }

    parse() {
        return this.parseSelect()
    }

    parseSelect() {
        this.consume(TOKEN_TYPES.KEYWORD, 'SELECT')

        const columns = this.parseColumns()

        this.consume(TOKEN_TYPES.KEYWORD, 'FROM')
        const table = this.consume(TOKEN_TYPES.IDENTIFIER).value

        let where = null
        if (this.current().type === TOKEN_TYPES.KEYWORD && this.current().value === 'WHERE') {
            this.consume()
            where = this.parseWhereConditions()
        }

        let groupBy = null
        if (this.current().type === TOKEN_TYPES.KEYWORD && this.current().value === 'GROUP') {
            this.consume() // GROUP
            this.consume(TOKEN_TYPES.KEYWORD, 'BY')
            groupBy = this.parseGroupBy()
        }

        let orderBy = null
        if (this.current().type === TOKEN_TYPES.KEYWORD && this.current().value === 'ORDER') {
            this.consume() // ORDER
            this.consume(TOKEN_TYPES.KEYWORD, 'BY')
            orderBy = this.parseOrderBy()
        }

        let limit = null
        if (this.current().type === TOKEN_TYPES.KEYWORD && this.current().value === 'LIMIT') {
            this.consume()
            limit = this.consume(TOKEN_TYPES.NUMBER).value
        }

        return { type: 'SELECT', columns, table, where, groupBy, orderBy, limit }
    }

    parseColumns() {
        const columns = []

        if (this.match(TOKEN_TYPES.STAR)) {
            return [{ type: 'star' }]
        }

        do {
            columns.push(this.parseColumn())
        } while (this.match(TOKEN_TYPES.COMMA))

        return columns
    }

    parseColumn() {
        // Check for aggregate function
        if (this.current().type === TOKEN_TYPES.KEYWORD && AGGREGATE_FUNCTIONS.includes(this.current().value)) {
            const func = this.consume().value
            this.consume(TOKEN_TYPES.LPAREN)

            let arg = '*'
            if (this.current().type === TOKEN_TYPES.STAR) {
                this.consume()
            } else {
                arg = this.consume(TOKEN_TYPES.IDENTIFIER).value
            }
            this.consume(TOKEN_TYPES.RPAREN)

            let alias = null
            if (this.current().type === TOKEN_TYPES.KEYWORD && this.current().value === 'AS') {
                this.consume()
                alias = this.consume(TOKEN_TYPES.IDENTIFIER).value
            }

            return { type: 'aggregate', func, arg, alias }
        }

        // Regular column
        const name = this.consume(TOKEN_TYPES.IDENTIFIER).value
        let alias = null

        if (this.current().type === TOKEN_TYPES.KEYWORD && this.current().value === 'AS') {
            this.consume()
            alias = this.consume(TOKEN_TYPES.IDENTIFIER).value
        }

        return { type: 'column', name, alias }
    }

    parseWhereConditions() {
        const conditions = [this.parseCondition()]

        while (this.current().type === TOKEN_TYPES.KEYWORD &&
            (this.current().value === 'AND' || this.current().value === 'OR')) {
            const op = this.consume().value
            conditions.push({ type: 'logical', op })
            conditions.push(this.parseCondition())
        }

        return conditions
    }

    parseCondition() {
        const field = this.consume(TOKEN_TYPES.IDENTIFIER).value
        const op = this.consume(TOKEN_TYPES.OPERATOR).value

        let value
        if (this.current().type === TOKEN_TYPES.STRING) {
            value = this.consume().value
        } else if (this.current().type === TOKEN_TYPES.NUMBER) {
            value = this.consume().value
        } else if (this.current().type === TOKEN_TYPES.KEYWORD) {
            value = this.consume().value
        } else {
            value = this.consume(TOKEN_TYPES.IDENTIFIER).value
        }

        return { type: 'condition', field, op, value }
    }

    parseGroupBy() {
        const fields = []
        do {
            fields.push(this.consume(TOKEN_TYPES.IDENTIFIER).value)
        } while (this.match(TOKEN_TYPES.COMMA))
        return fields
    }

    parseOrderBy() {
        const orders = []
        do {
            const field = this.consume(TOKEN_TYPES.IDENTIFIER).value
            let direction = 'ASC'
            if (this.current().type === TOKEN_TYPES.KEYWORD &&
                (this.current().value === 'ASC' || this.current().value === 'DESC')) {
                direction = this.consume().value
            }
            orders.push({ field, direction })
        } while (this.match(TOKEN_TYPES.COMMA))
        return orders
    }
}

// ==================== EXECUTOR ====================

function executeCondition(row, condition) {
    const fieldValue = row[condition.field]
    const compareValue = condition.value

    switch (condition.op) {
        case '=':
            return fieldValue == compareValue
        case '!=':
            return fieldValue != compareValue
        case '>':
            return fieldValue > compareValue
        case '<':
            return fieldValue < compareValue
        case '>=':
            return fieldValue >= compareValue
        case '<=':
            return fieldValue <= compareValue
        default:
            return true
    }
}

function executeWhere(data, conditions) {
    if (!conditions) return data

    return data.filter(row => {
        let result = true
        let currentOp = 'AND'

        for (const cond of conditions) {
            if (cond.type === 'logical') {
                currentOp = cond.op
            } else {
                const condResult = executeCondition(row, cond)
                if (currentOp === 'AND') {
                    result = result && condResult
                } else {
                    result = result || condResult
                }
            }
        }
        return result
    })
}

function executeGroupBy(data, groupByFields, columns) {
    const groups = new Map()

    for (const row of data) {
        const key = groupByFields.map(f => row[f]).join('|||')
        if (!groups.has(key)) {
            groups.set(key, [])
        }
        groups.get(key).push(row)
    }

    const results = []
    for (const [key, rows] of groups) {
        const result = {}

        // Add group by fields
        for (const field of groupByFields) {
            result[field] = rows[0][field]
        }

        // Calculate aggregates
        for (const col of columns) {
            if (col.type === 'aggregate') {
                const values = col.arg === '*' ? rows : rows.map(r => r[col.arg]).filter(v => v !== null && v !== undefined)
                const numericValues = values.map(v => typeof v === 'number' ? v : parseFloat(v) || 0)

                let aggResult
                switch (col.func) {
                    case 'COUNT':
                        aggResult = col.arg === '*' ? rows.length : values.length
                        break
                    case 'SUM':
                        aggResult = numericValues.reduce((a, b) => a + b, 0)
                        break
                    case 'AVG':
                        aggResult = numericValues.length > 0
                            ? numericValues.reduce((a, b) => a + b, 0) / numericValues.length
                            : 0
                        break
                    case 'MIN':
                        aggResult = Math.min(...numericValues)
                        break
                    case 'MAX':
                        aggResult = Math.max(...numericValues)
                        break
                    default:
                        aggResult = null
                }
                result[col.alias || `${col.func}(${col.arg})`] = aggResult
            }
        }

        results.push(result)
    }

    return results
}

function executeOrderBy(data, orderBy) {
    if (!orderBy) return data

    return [...data].sort((a, b) => {
        for (const { field, direction } of orderBy) {
            const aVal = a[field]
            const bVal = b[field]

            let cmp = 0
            if (typeof aVal === 'number' && typeof bVal === 'number') {
                cmp = aVal - bVal
            } else {
                cmp = String(aVal).localeCompare(String(bVal))
            }

            if (cmp !== 0) {
                return direction === 'DESC' ? -cmp : cmp
            }
        }
        return 0
    })
}

function executeSelect(data, columns) {
    if (columns.length === 1 && columns[0].type === 'star') {
        return data
    }

    return data.map(row => {
        const result = {}
        for (const col of columns) {
            if (col.type === 'column') {
                const key = col.alias || col.name
                result[key] = row[col.name]
            } else if (col.type === 'aggregate') {
                const key = col.alias || `${col.func}(${col.arg})`
                result[key] = row[key]
            }
        }
        return result
    })
}

// ==================== MAIN API ====================

/**
 * Execute a SQL-like query against the data
 * @param {string} sql - SQL query string
 * @param {Object} dataSources - { transactions: [], goals: [] }
 * @returns {{ columns: string[], rows: Object[], error: string|null }}
 */
export function executeQuery(sql, dataSources) {
    try {
        const tokens = tokenize(sql)
        const parser = new Parser(tokens)
        const ast = parser.parse()

        // Get source data
        let data = dataSources[ast.table]
        if (!data) {
            throw new Error(`Unknown table: ${ast.table}. Available: transactions, goals`)
        }
        data = [...data] // Clone to avoid mutations

        // Execute pipeline
        data = executeWhere(data, ast.where)

        const hasAggregates = ast.columns.some(c => c.type === 'aggregate')

        if (ast.groupBy || hasAggregates) {
            const groupFields = ast.groupBy || []
            data = executeGroupBy(data, groupFields, ast.columns)
        }

        data = executeOrderBy(data, ast.orderBy)

        if (ast.limit) {
            data = data.slice(0, ast.limit)
        }

        data = executeSelect(data, ast.columns)

        // Extract column names
        const columnNames = data.length > 0 ? Object.keys(data[0]) : []

        return {
            columns: columnNames,
            rows: data,
            error: null,
            rowCount: data.length
        }

    } catch (error) {
        return {
            columns: [],
            rows: [],
            error: error.message,
            rowCount: 0
        }
    }
}

/**
 * Get available tables and their columns
 * @param {Object} dataSources - { transactions: [], goals: [] }
 * @returns {Object} Schema information
 */
export function getSchema(dataSources) {
    const schema = {}

    for (const [table, data] of Object.entries(dataSources)) {
        if (data.length > 0) {
            schema[table] = Object.keys(data[0])
        } else {
            schema[table] = []
        }
    }

    return schema
}

/**
 * Sample queries for the UI
 */
export const SAMPLE_QUERIES = [
    {
        name: 'Expenses by Category',
        sql: `SELECT category, SUM(amount) AS total FROM transactions WHERE type = 'expense' GROUP BY category ORDER BY total DESC`
    },
    {
        name: 'Monthly Income',
        sql: `SELECT category, amount, date FROM transactions WHERE type = 'income' ORDER BY date DESC`
    },
    {
        name: 'Top 10 Expenses',
        sql: `SELECT name, category, amount, date FROM transactions WHERE type = 'expense' ORDER BY amount DESC LIMIT 10`
    },
    {
        name: 'Recurring Subscriptions',
        sql: `SELECT name, company, amount, frequency FROM transactions WHERE frequency != 'once' AND type = 'expense' ORDER BY amount DESC`
    },
    {
        name: 'All Goals',
        sql: `SELECT title, targetAmount, currentAmount, deadline FROM goals ORDER BY deadline ASC`
    },
    {
        name: 'Transaction Count by Type',
        sql: `SELECT type, COUNT(*) AS count FROM transactions GROUP BY type`
    }
]

export default {
    executeQuery,
    getSchema,
    SAMPLE_QUERIES
}
