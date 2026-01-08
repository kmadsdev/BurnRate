import { useState, useRef, useEffect } from 'react'
import { executeQuery, getSchema, SAMPLE_QUERIES } from '../../utils/queryEngine'
import { useData } from '../../context/DataContext'

const PlayIcon = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
        <path d="M4 2l10 6-10 6V2z" />
    </svg>
)

const CopyIcon = () => (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="5" y="5" width="9" height="9" rx="1" />
        <path d="M2 11V3a1 1 0 011-1h8" />
    </svg>
)

const DownloadIcon = () => (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M8 2v8M4 7l4 4 4-4M2 14h12" />
    </svg>
)

function QueryConsole({ onResults }) {
    const { transactions, goals } = useData()
    const [query, setQuery] = useState(SAMPLE_QUERIES[0].sql)
    const [results, setResults] = useState(null)
    const [history, setHistory] = useState(() => {
        const saved = localStorage.getItem('burnrate-query-history')
        return saved ? JSON.parse(saved) : []
    })
    const [showHistory, setShowHistory] = useState(false)
    const textareaRef = useRef(null)

    const dataSources = { transactions, goals }

    const runQuery = () => {
        const result = executeQuery(query, dataSources)
        setResults(result)
        onResults?.(result)

        // Add to history
        if (!result.error && query.trim()) {
            const newHistory = [
                { query: query.trim(), timestamp: Date.now() },
                ...history.filter(h => h.query !== query.trim())
            ].slice(0, 20)
            setHistory(newHistory)
            localStorage.setItem('burnrate-query-history', JSON.stringify(newHistory))
        }
    }

    const handleKeyDown = (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault()
            runQuery()
        }
    }

    const exportResults = () => {
        if (!results || results.rows.length === 0) return

        const csv = [
            results.columns.join(','),
            ...results.rows.map(row =>
                results.columns.map(col => {
                    const val = row[col]
                    return typeof val === 'string' && val.includes(',') ? `"${val}"` : val
                }).join(',')
            )
        ].join('\n')

        const blob = new Blob([csv], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `query-results-${Date.now()}.csv`
        a.click()
    }

    const copyResults = () => {
        if (!results || results.rows.length === 0) return
        const text = JSON.stringify(results.rows, null, 2)
        navigator.clipboard.writeText(text)
    }

    const schema = getSchema(dataSources)

    return (
        <div className="query-console">
            <div className="console-layout">
                {/* Sidebar */}
                <div className="console-sidebar">
                    <div className="sidebar-section">
                        <h4>Tables</h4>
                        {Object.entries(schema).map(([table, columns]) => (
                            <div key={table} className="table-item">
                                <span className="table-name">{table}</span>
                                <div className="column-list">
                                    {columns.map(col => (
                                        <span
                                            key={col}
                                            className="column-name"
                                            onClick={() => setQuery(q => q + col)}
                                        >
                                            {col}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="sidebar-section">
                        <h4>Sample Queries</h4>
                        {SAMPLE_QUERIES.map((sq, idx) => (
                            <button
                                key={idx}
                                className="sample-query-btn"
                                onClick={() => setQuery(sq.sql)}
                            >
                                {sq.name}
                            </button>
                        ))}
                    </div>

                    {history.length > 0 && (
                        <div className="sidebar-section">
                            <h4 onClick={() => setShowHistory(!showHistory)} style={{ cursor: 'pointer' }}>
                                History {showHistory ? '▼' : '▶'}
                            </h4>
                            {showHistory && history.map((h, idx) => (
                                <button
                                    key={idx}
                                    className="history-btn"
                                    onClick={() => setQuery(h.query)}
                                    title={h.query}
                                >
                                    {h.query.slice(0, 40)}...
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Main area */}
                <div className="console-main">
                    <div className="query-input-area">
                        <textarea
                            ref={textareaRef}
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="SELECT * FROM transactions WHERE type = 'expense'"
                            spellCheck={false}
                        />
                        <div className="query-actions">
                            <span className="shortcut-hint">Ctrl+Enter to run</span>
                            <button className="run-btn" onClick={runQuery}>
                                <PlayIcon /> Run
                            </button>
                        </div>
                    </div>

                    {/* Results */}
                    {results && (
                        <div className="results-area">
                            <div className="results-header">
                                <span className="results-info">
                                    {results.error
                                        ? <span className="error-text">Error: {results.error}</span>
                                        : `${results.rowCount} rows returned`
                                    }
                                </span>
                                {!results.error && results.rows.length > 0 && (
                                    <div className="results-actions">
                                        <button onClick={copyResults} title="Copy as JSON">
                                            <CopyIcon /> Copy
                                        </button>
                                        <button onClick={exportResults} title="Export CSV">
                                            <DownloadIcon /> Export
                                        </button>
                                    </div>
                                )}
                            </div>

                            {!results.error && results.rows.length > 0 && (
                                <div className="results-table-wrapper">
                                    <table className="results-table">
                                        <thead>
                                            <tr>
                                                {results.columns.map(col => (
                                                    <th key={col}>{col}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {results.rows.map((row, idx) => (
                                                <tr key={idx}>
                                                    {results.columns.map(col => (
                                                        <td key={col}>
                                                            {typeof row[col] === 'number'
                                                                ? row[col].toLocaleString()
                                                                : String(row[col] ?? '')}
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default QueryConsole
