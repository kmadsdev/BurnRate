import { useState, useEffect } from 'react'
import { QueryConsole, ChartBuilder, DataExplorer, QuickMetrics } from '../components/Analytics'
import { useData } from '../context/DataContext'
import { formatCurrency } from '../utils/calculations'

const TABS = [
    { id: 'console', label: 'Console', icon: '⌨️' },
    { id: 'charts', label: 'Charts', icon: '📊' },
    { id: 'data', label: 'Data', icon: '📋' },
    { id: 'metrics', label: 'Metrics', icon: '📈' }
]

function Analytics() {
    const [activeTab, setActiveTab] = useState('console')
    const [showCommandPalette, setShowCommandPalette] = useState(false)
    const [commandInput, setCommandInput] = useState('')
    const { transactions, goals, addTransaction, currency } = useData()

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Ctrl+K or Cmd+K for command palette
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault()
                setShowCommandPalette(true)
                setCommandInput('')
            }

            // Tab switching with Ctrl+1-4
            if ((e.ctrlKey || e.metaKey) && ['1', '2', '3', '4'].includes(e.key)) {
                e.preventDefault()
                const idx = parseInt(e.key) - 1
                if (TABS[idx]) {
                    setActiveTab(TABS[idx].id)
                }
            }

            // Escape to close command palette
            if (e.key === 'Escape' && showCommandPalette) {
                setShowCommandPalette(false)
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [showCommandPalette])

    // Command execution
    const executeCommand = (cmd) => {
        const parts = cmd.trim().toLowerCase().split(/\s+/)
        const command = parts[0]

        switch (command) {
            case 'add':
                // add expense|income <amount> <category>
                if (parts.length >= 4) {
                    const type = parts[1]
                    const amount = parseFloat(parts[2])
                    const category = parts.slice(3).join(' ')
                    if (!isNaN(amount) && (type === 'expense' || type === 'income')) {
                        const now = new Date()
                        addTransaction({
                            type,
                            amount,
                            category,
                            frequency: 'once',
                            date: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`,
                            name: '',
                            company: '',
                            description: 'Added via command'
                        })
                        return `Added ${type}: ${formatCurrency(amount, currency)} in ${category}`
                    }
                }
                return 'Usage: add expense|income <amount> <category>'

            case 'goto':
            case 'go':
                const target = parts[1]
                const tabMatch = TABS.find(t => t.id.startsWith(target) || t.label.toLowerCase().startsWith(target))
                if (tabMatch) {
                    setActiveTab(tabMatch.id)
                    return `Switched to ${tabMatch.label}`
                }
                return `Unknown tab: ${target}`

            case 'stats':
            case 'summary':
                const totalIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
                const totalExpense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
                return `Balance: ${formatCurrency(totalIncome - totalExpense, currency)} | Income: ${formatCurrency(totalIncome, currency)} | Expenses: ${formatCurrency(totalExpense, currency)}`

            case 'count':
                return `Transactions: ${transactions.length} | Goals: ${goals.length}`

            case 'help':
            case '?':
                return 'Commands: add <type> <amount> <category>, goto <tab>, stats, count, help'

            default:
                return `Unknown command: ${command}. Type "help" for available commands.`
        }
    }

    const [commandResult, setCommandResult] = useState('')

    const handleCommandSubmit = (e) => {
        e.preventDefault()
        if (commandInput.trim()) {
            const result = executeCommand(commandInput)
            setCommandResult(result)
            setTimeout(() => {
                setShowCommandPalette(false)
                setCommandResult('')
            }, 1500)
        }
    }

    return (
        <div className="page analytics-page">
            <header className="analytics-header">
                <div className="header-left">
                    <h1 className="dashboard-title">Analytics</h1>
                    <span className="dev-badge">DEV MODE</span>
                </div>
                <div className="header-right">
                    <span className="shortcut-hint">Ctrl+K for commands</span>
                </div>
            </header>

            {/* Tabs */}
            <div className="analytics-tabs">
                {TABS.map((tab, idx) => (
                    <button
                        key={tab.id}
                        className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        <span className="tab-icon">{tab.icon}</span>
                        <span className="tab-label">{tab.label}</span>
                        <span className="tab-shortcut">⌘{idx + 1}</span>
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="analytics-content">
                {activeTab === 'console' && <QueryConsole />}
                {activeTab === 'charts' && <ChartBuilder />}
                {activeTab === 'data' && <DataExplorer />}
                {activeTab === 'metrics' && <QuickMetrics />}
            </div>

            {/* Command Palette */}
            {showCommandPalette && (
                <div className="command-palette-overlay" onClick={() => setShowCommandPalette(false)}>
                    <div className="command-palette" onClick={e => e.stopPropagation()}>
                        <form onSubmit={handleCommandSubmit}>
                            <input
                                type="text"
                                value={commandInput}
                                onChange={(e) => setCommandInput(e.target.value)}
                                placeholder="Type a command... (help for list)"
                                autoFocus
                            />
                        </form>
                        {commandResult && (
                            <div className="command-result">{commandResult}</div>
                        )}
                        <div className="command-hints">
                            <span>add expense 50 food</span>
                            <span>goto charts</span>
                            <span>stats</span>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .analytics-page {
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    background-color: var(--bg-primary);
                }

                .analytics-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 16px;
                }

                .header-left {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .dev-badge {
                    background: linear-gradient(135deg, #61E813 0%, #3498DB 100%);
                    color: #000;
                    font-size: 10px;
                    font-weight: 700;
                    padding: 4px 8px;
                    border-radius: 4px;
                    letter-spacing: 0.1em;
                    font-family: 'JetBrains Mono', 'Fira Code', monospace;
                }

                .shortcut-hint {
                    font-size: 12px;
                    color: var(--text-muted);
                    font-family: 'JetBrains Mono', 'Fira Code', monospace;
                }

                .analytics-tabs {
                    display: flex;
                    gap: 8px;
                    margin-bottom: 20px;
                    border-bottom: 1px solid rgba(255,255,255,0.1);
                    padding-bottom: 12px;
                }

                .tab-btn {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 10px 16px;
                    background: transparent;
                    border: 1px solid transparent;
                    color: var(--text-secondary);
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.2s;
                    font-family: inherit;
                }

                .tab-btn:hover {
                    background-color: var(--bg-hover);
                    color: var(--text-primary);
                }

                .tab-btn.active {
                    background-color: var(--bg-card);
                    color: var(--text-primary);
                    border-color: rgba(65, 105, 225, 0.5);
                }

                .tab-icon {
                    font-size: 16px;
                }

                .tab-label {
                    font-weight: 500;
                }

                .tab-shortcut {
                    font-size: 10px;
                    opacity: 0.5;
                    font-family: 'JetBrains Mono', 'Fira Code', monospace;
                }

                .analytics-content {
                    flex: 1;
                    overflow: auto;
                }

                /* Command Palette */
                .command-palette-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0, 0, 0, 0.7);
                    display: flex;
                    align-items: flex-start;
                    justify-content: center;
                    padding-top: 15vh;
                    z-index: 10000;
                    backdrop-filter: blur(4px);
                }

                .command-palette {
                    width: 100%;
                    max-width: 500px;
                    background-color: var(--bg-card);
                    border-radius: 12px;
                    border: 1px solid rgba(97, 232, 19, 0.3);
                    overflow: hidden;
                    box-shadow: 0 20px 60px rgba(0,0,0,0.5);
                }

                .command-palette input {
                    width: 100%;
                    padding: 16px 20px;
                    border: none;
                    background: var(--bg-primary);
                    color: var(--text-primary);
                    font-size: 16px;
                    font-family: 'JetBrains Mono', 'Fira Code', monospace;
                    outline: none;
                }

                .command-palette input::placeholder {
                    color: var(--text-muted);
                }

                .command-result {
                    padding: 12px 20px;
                    background: rgba(97, 232, 19, 0.1);
                    color: #61E813;
                    font-family: 'JetBrains Mono', 'Fira Code', monospace;
                    font-size: 13px;
                }

                .command-hints {
                    display: flex;
                    gap: 12px;
                    padding: 12px 20px;
                    background: var(--bg-secondary);
                    font-size: 11px;
                    color: var(--text-muted);
                    font-family: 'JetBrains Mono', 'Fira Code', monospace;
                }

                .command-hints span {
                    background: var(--bg-primary);
                    padding: 4px 8px;
                    border-radius: 4px;
                }

                /* Query Console Styles */
                .query-console {
                    height: 100%;
                }

                .console-layout {
                    display: grid;
                    grid-template-columns: 250px 1fr;
                    gap: 20px;
                    height: calc(100vh - 220px);
                }

                .console-sidebar {
                    background-color: var(--bg-card);
                    border-radius: 12px;
                    padding: 16px;
                    overflow-y: auto;
                }

                .sidebar-section {
                    margin-bottom: 20px;
                }

                .sidebar-section h4 {
                    font-size: 11px;
                    text-transform: uppercase;
                    letter-spacing: 0.1em;
                    color: var(--text-muted);
                    margin-bottom: 12px;
                }

                .table-item {
                    margin-bottom: 12px;
                }

                .table-name {
                    font-weight: 600;
                    color: #61E813;
                    font-family: 'JetBrains Mono', 'Fira Code', monospace;
                    font-size: 13px;
                }

                .column-list {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 4px;
                    margin-top: 8px;
                }

                .column-name {
                    font-size: 11px;
                    padding: 2px 6px;
                    background: var(--bg-primary);
                    border-radius: 4px;
                    color: var(--text-secondary);
                    cursor: pointer;
                    font-family: 'JetBrains Mono', 'Fira Code', monospace;
                }

                .column-name:hover {
                    background: var(--bg-hover);
                    color: var(--text-primary);
                }

                .sample-query-btn, .history-btn {
                    display: block;
                    width: 100%;
                    text-align: left;
                    padding: 8px 12px;
                    margin-bottom: 4px;
                    background: var(--bg-primary);
                    border: none;
                    border-radius: 6px;
                    color: var(--text-secondary);
                    font-size: 12px;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .sample-query-btn:hover, .history-btn:hover {
                    background: var(--bg-hover);
                    color: var(--text-primary);
                }

                .console-main {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }

                .query-input-area {
                    background-color: var(--bg-card);
                    border-radius: 12px;
                    overflow: hidden;
                }

                .query-input-area textarea {
                    width: 100%;
                    min-height: 120px;
                    padding: 16px;
                    border: none;
                    background: #1a1a2e;
                    color: #61E813;
                    font-family: 'JetBrains Mono', 'Fira Code', monospace;
                    font-size: 14px;
                    line-height: 1.5;
                    resize: vertical;
                    outline: none;
                }

                .query-actions {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 12px 16px;
                    background: var(--bg-secondary);
                }

                .run-btn {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 8px 16px;
                    background: linear-gradient(135deg, #61E813 0%, #3498DB 100%);
                    border: none;
                    border-radius: 6px;
                    color: #000;
                    font-weight: 600;
                    cursor: pointer;
                }

                .run-btn:hover {
                    opacity: 0.9;
                }

                .results-area {
                    flex: 1;
                    background-color: var(--bg-card);
                    border-radius: 12px;
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                }

                .results-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 12px 16px;
                    background: var(--bg-secondary);
                }

                .results-info {
                    font-size: 13px;
                    color: var(--text-secondary);
                    font-family: 'JetBrains Mono', 'Fira Code', monospace;
                }

                .error-text {
                    color: #FF4F79;
                }

                .results-actions {
                    display: flex;
                    gap: 8px;
                }

                .results-actions button {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    padding: 6px 12px;
                    background: var(--bg-primary);
                    border: none;
                    border-radius: 4px;
                    color: var(--text-secondary);
                    font-size: 12px;
                    cursor: pointer;
                }

                .results-actions button:hover {
                    background: var(--bg-hover);
                    color: var(--text-primary);
                }

                .results-table-wrapper {
                    flex: 1;
                    overflow: auto;
                }

                .results-table {
                    width: 100%;
                    border-collapse: collapse;
                    font-family: 'JetBrains Mono', 'Fira Code', monospace;
                    font-size: 13px;
                }

                .results-table th, .results-table td {
                    padding: 10px 16px;
                    text-align: left;
                    border-bottom: 1px solid rgba(255,255,255,0.05);
                }

                .results-table th {
                    background: var(--bg-primary);
                    color: var(--text-secondary);
                    font-weight: 600;
                    position: sticky;
                    top: 0;
                }

                .results-table tr:hover {
                    background: rgba(255,255,255,0.02);
                }

                /* Chart Builder Styles */
                .chart-builder {
                    height: calc(100vh - 220px);
                }

                .builder-layout {
                    display: grid;
                    grid-template-columns: 280px 1fr;
                    gap: 20px;
                    height: 100%;
                }

                .config-panel {
                    background-color: var(--bg-card);
                    border-radius: 12px;
                    padding: 20px;
                    overflow-y: auto;
                }

                .config-panel h4 {
                    font-size: 14px;
                    margin-bottom: 20px;
                    color: var(--text-primary);
                }

                .config-group {
                    margin-bottom: 20px;
                }

                .config-group label {
                    display: block;
                    font-size: 12px;
                    color: var(--text-muted);
                    margin-bottom: 8px;
                }

                .config-group select {
                    width: 100%;
                    padding: 10px 12px;
                    background: var(--bg-primary);
                    border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 8px;
                    color: var(--text-primary);
                    font-size: 14px;
                }

                .chart-type-selector {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 8px;
                }

                .type-btn {
                    padding: 10px;
                    background: var(--bg-primary);
                    border: 1px solid transparent;
                    border-radius: 8px;
                    color: var(--text-secondary);
                    text-transform: capitalize;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .type-btn.active {
                    border-color: #4169E1;
                    background: rgba(65, 105, 225, 0.1);
                    color: var(--text-primary);
                }

                .save-chart-btn {
                    width: 100%;
                    padding: 12px;
                    background: linear-gradient(135deg, #4169E1 0%, #9B59B6 100%);
                    border: none;
                    border-radius: 8px;
                    color: white;
                    font-weight: 600;
                    cursor: pointer;
                    margin-top: 20px;
                }

                .saved-charts {
                    margin-top: 24px;
                    padding-top: 20px;
                    border-top: 1px solid rgba(255,255,255,0.1);
                }

                .saved-charts h5 {
                    font-size: 11px;
                    text-transform: uppercase;
                    color: var(--text-muted);
                    margin-bottom: 12px;
                }

                .saved-chart-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 8px 12px;
                    background: var(--bg-primary);
                    border-radius: 6px;
                    margin-bottom: 8px;
                }

                .saved-chart-item span {
                    cursor: pointer;
                    color: var(--text-secondary);
                }

                .saved-chart-item span:hover {
                    color: var(--text-primary);
                }

                .saved-chart-item button {
                    background: none;
                    border: none;
                    color: var(--text-muted);
                    cursor: pointer;
                    font-size: 16px;
                }

                .chart-preview {
                    background-color: var(--bg-card);
                    border-radius: 12px;
                    padding: 20px;
                    display: flex;
                    flex-direction: column;
                }

                .preview-header {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 20px;
                }

                .preview-header h4 {
                    font-size: 14px;
                }

                .data-count {
                    font-size: 12px;
                    color: var(--text-muted);
                }

                .bar-chart {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .bar-row {
                    display: grid;
                    grid-template-columns: 120px 1fr 100px;
                    align-items: center;
                    gap: 12px;
                }

                .bar-label {
                    font-size: 13px;
                    color: var(--text-secondary);
                    text-overflow: ellipsis;
                    overflow: hidden;
                    white-space: nowrap;
                }

                .bar-track {
                    height: 24px;
                    background: var(--bg-primary);
                    border-radius: 4px;
                    overflow: hidden;
                }

                .bar-fill {
                    height: 100%;
                    border-radius: 4px;
                    transition: width 0.3s ease;
                }

                .bar-value {
                    font-size: 13px;
                    font-weight: 600;
                    color: var(--text-primary);
                    text-align: right;
                }

                .pie-chart-container {
                    padding: 20px;
                }

                .pie-legend {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .legend-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .legend-color {
                    width: 12px;
                    height: 12px;
                    border-radius: 3px;
                }

                .legend-label {
                    flex: 1;
                    font-size: 13px;
                    color: var(--text-secondary);
                }

                .legend-pct {
                    font-size: 13px;
                    font-weight: 600;
                    color: var(--text-primary);
                }

                .line-chart {
                    padding: 20px;
                }

                .line-chart svg {
                    width: 100%;
                    height: 200px;
                }

                .line-labels {
                    display: flex;
                    justify-content: space-between;
                    margin-top: 8px;
                    font-size: 11px;
                    color: var(--text-muted);
                }

                /* Data Explorer Styles */
                .data-explorer {
                    height: calc(100vh - 220px);
                    display: flex;
                    flex-direction: column;
                }

                .explorer-toolbar {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 12px 16px;
                    background: var(--bg-card);
                    border-radius: 12px 12px 0 0;
                    border-bottom: 1px solid rgba(255,255,255,0.05);
                }

                .toolbar-left {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                }

                .row-count {
                    font-size: 13px;
                    color: var(--text-muted);
                }

                .selected-count {
                    font-size: 13px;
                    color: #4169E1;
                    font-weight: 600;
                }

                .toolbar-btn {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 6px 12px;
                    background: var(--bg-primary);
                    border: none;
                    border-radius: 6px;
                    color: var(--text-secondary);
                    font-size: 12px;
                    cursor: pointer;
                }

                .toolbar-btn.danger {
                    background: rgba(255, 79, 121, 0.1);
                    color: #FF4F79;
                }

                .column-toggle {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    font-size: 12px;
                    color: var(--text-muted);
                }

                .column-checkbox {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    cursor: pointer;
                }

                .column-checkbox input {
                    width: 14px;
                    height: 14px;
                }

                .explorer-table-wrapper {
                    flex: 1;
                    overflow: auto;
                    background: var(--bg-card);
                    border-radius: 0 0 12px 12px;
                }

                .explorer-table {
                    width: 100%;
                    border-collapse: collapse;
                    font-size: 13px;
                }

                .explorer-table th, .explorer-table td {
                    padding: 10px 12px;
                    text-align: left;
                    border-bottom: 1px solid rgba(255,255,255,0.05);
                }

                .explorer-table .header-row th {
                    background: var(--bg-secondary);
                    position: sticky;
                    top: 0;
                    cursor: pointer;
                    font-weight: 600;
                    color: var(--text-secondary);
                    z-index: 2;
                }

                .explorer-table .header-row th:hover {
                    color: var(--text-primary);
                }

                .explorer-table .header-row th.sorted {
                    color: #4169E1;
                }

                .sort-arrow {
                    font-size: 10px;
                }

                .explorer-table .filter-row th {
                    background: var(--bg-primary);
                    padding: 6px 8px;
                    position: sticky;
                    top: 38px;
                    z-index: 1;
                }

                .filter-input {
                    width: 100%;
                    padding: 6px 8px;
                    background: var(--bg-card);
                    border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 4px;
                    color: var(--text-primary);
                    font-size: 12px;
                }

                .checkbox-col {
                    width: 40px;
                    text-align: center;
                }

                .actions-col {
                    width: 60px;
                    text-align: center;
                }

                .explorer-table tr.selected {
                    background: rgba(65, 105, 225, 0.1);
                }

                .explorer-table td.editable {
                    cursor: pointer;
                }

                .explorer-table td.editable:hover {
                    background: rgba(255,255,255,0.02);
                }

                .edit-input {
                    width: 100%;
                    padding: 4px 8px;
                    background: var(--bg-primary);
                    border: 2px solid #4169E1;
                    border-radius: 4px;
                    color: var(--text-primary);
                    font-size: 13px;
                }

                .cell-value.income {
                    color: #61E813;
                }

                .cell-value.expense {
                    color: #FF4F79;
                }

                .action-btn {
                    background: none;
                    border: none;
                    color: var(--text-muted);
                    cursor: pointer;
                    padding: 4px;
                }

                .action-btn:hover {
                    color: #FF4F79;
                }

                .empty-state {
                    padding: 40px;
                    text-align: center;
                    color: var(--text-muted);
                }

                /* Quick Metrics Styles */
                .quick-metrics {
                    display: flex;
                    flex-direction: column;
                    gap: 24px;
                }

                .metrics-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
                    gap: 16px;
                }

                .metric-card {
                    display: flex;
                    align-items: flex-start;
                    gap: 16px;
                    background: var(--bg-card);
                    border-radius: 12px;
                    padding: 20px;
                }

                .metric-icon {
                    font-size: 28px;
                }

                .metric-content {
                    display: flex;
                    flex-direction: column;
                }

                .metric-value {
                    font-size: 24px;
                    font-weight: 700;
                    line-height: 1.2;
                }

                .metric-label {
                    font-size: 13px;
                    color: var(--text-secondary);
                    margin-top: 4px;
                }

                .metric-subvalue {
                    font-size: 11px;
                    color: var(--text-muted);
                    margin-top: 4px;
                }

                .stats-table {
                    background: var(--bg-card);
                    border-radius: 12px;
                    padding: 20px;
                }

                .stats-table h4 {
                    font-size: 14px;
                    margin-bottom: 16px;
                }

                .stats-table table {
                    width: 100%;
                }

                .stats-table td {
                    padding: 10px 0;
                    border-bottom: 1px solid rgba(255,255,255,0.05);
                }

                .stats-table td:last-child {
                    text-align: right;
                    font-weight: 600;
                }

                .stats-table .income {
                    color: #61E813;
                }

                .stats-table .expense {
                    color: #FF4F79;
                }
            `}</style>
        </div>
    )
}

export default Analytics
