import React, { useState, useRef } from 'react'
import { useTheme } from '../context/ThemeContext'
import { useWidgets } from '../context/WidgetContext'
import { useData } from '../context/DataContext'
import { exportToCSV, exportToXLSX, importFromFile } from '../services/dataGateway'


function Settings() {
    const { theme, toggleTheme } = useTheme()
    const {
        gridLayout,
        updateGridLayout,
        widgets,
        updateWidgetsList,
        WIDGET_DEFINITIONS
    } = useWidgets()
    const { currency, setCurrency, exportData, importData } = useData()

    // Local state for pending changes
    const [pendingGrid, setPendingGrid] = useState(gridLayout)
    const [hasChanges, setHasChanges] = useState(false)

    // Import/Export state
    const [importStatus, setImportStatus] = useState({ type: '', message: '' })
    const [showConfirmDialog, setShowConfirmDialog] = useState(false)
    const [pendingImportData, setPendingImportData] = useState(null)
    const [isExporting, setIsExporting] = useState(false)
    const fileInputRef = useRef(null)

    const handleGridSelect = (cols, rows) => {
        setPendingGrid({ columns: cols, rows })
        setHasChanges(true)
    }

    const applyChanges = () => {
        // Calculate total slots in new grid
        const totalSlots = pendingGrid.columns * pendingGrid.rows

        let currentSlots = 0
        const keptWidgets = []

        // Filter widgets that fit
        for (const widget of widgets) {
            // Treat placeholders as 1x1
            const size = widget.isPlaceholder ? '1x1' : widget.size
            const [w, h] = size.split('x').map(Number)
            const widgetSlots = w * h

            if (currentSlots + widgetSlots <= totalSlots) {
                keptWidgets.push(widget)
                currentSlots += widgetSlots
            } else {
                // Widget/Placeholder doesn't fit
                // If it's a real widget, it naturally goes back to 'available' map because it's not in the active list
            }
        }

        // Fill remaining slots with placeholders if expanding
        while (currentSlots < totalSlots) {
            keptWidgets.push({
                id: `empty-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                size: '1x1',
                isPlaceholder: true
            })
            currentSlots++
        }

        // 1. Update grid layout
        updateGridLayout(pendingGrid)

        // 2. Update widgets list
        updateWidgetsList(keptWidgets)

        setHasChanges(false)
    }

    // Export handlers
    const handleExportCSV = () => {
        setIsExporting(true)
        try {
            const data = exportData()
            exportToCSV(data)
            setImportStatus({ type: 'success', message: 'Data exported to CSV successfully!' })
        } catch (error) {
            setImportStatus({ type: 'error', message: `Export failed: ${error.message}` })
        } finally {
            setIsExporting(false)
            setTimeout(() => setImportStatus({ type: '', message: '' }), 5000)
        }
    }

    const handleExportXLSX = () => {
        setIsExporting(true)
        try {
            const data = exportData()
            exportToXLSX(data)
            setImportStatus({ type: 'success', message: 'Data exported to XLSX successfully!' })
        } catch (error) {
            setImportStatus({ type: 'error', message: `Export failed: ${error.message}` })
        } finally {
            setIsExporting(false)
            setTimeout(() => setImportStatus({ type: '', message: '' }), 5000)
        }
    }

    // Import handlers
    const handleImportClick = () => {
        fileInputRef.current?.click()
    }

    const handleFileSelect = async (e) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Reset file input
        e.target.value = ''

        // Validate file type
        const validTypes = ['.csv', '.xlsx', '.xls']
        const fileExt = file.name.substring(file.name.lastIndexOf('.')).toLowerCase()
        if (!validTypes.includes(fileExt)) {
            setImportStatus({ type: 'error', message: 'Invalid file type. Please use CSV or XLSX files.' })
            setTimeout(() => setImportStatus({ type: '', message: '' }), 5000)
            return
        }

        // Parse file
        setImportStatus({ type: 'loading', message: 'Parsing file...' })
        const result = await importFromFile(file)

        if (result.errors.length > 0) {
            setImportStatus({
                type: 'error',
                message: `Import failed: ${result.errors.slice(0, 3).join(', ')}${result.errors.length > 3 ? ` (+${result.errors.length - 3} more)` : ''}`
            })
            setTimeout(() => setImportStatus({ type: '', message: '' }), 8000)
            return
        }

        // Show confirmation dialog
        setPendingImportData(result.data)
        setShowConfirmDialog(true)
        setImportStatus({ type: '', message: '' })
    }

    const confirmImport = () => {
        if (pendingImportData) {
            importData(pendingImportData)
            setImportStatus({ type: 'success', message: 'Data imported successfully!' })
            setTimeout(() => setImportStatus({ type: '', message: '' }), 5000)
        }
        setShowConfirmDialog(false)
        setPendingImportData(null)
    }

    const cancelImport = () => {
        setShowConfirmDialog(false)
        setPendingImportData(null)
    }

    const layouts = [
        { cols: 4, rows: 2, label: '4 x 2' },
        { cols: 5, rows: 2, label: '5 x 2' },
        { cols: 4, rows: 3, label: '4 x 3' },
        { cols: 5, rows: 3, label: '5 x 3' },
    ]

    return (
        <div className="page">
            <header className="dashboard-header">
                <h1 className="dashboard-title">Settings</h1>
            </header>

            <div className="page-content" style={{ maxWidth: '800px' }}>
                <div className="settings-section">
                    <h2>Appearance</h2>
                    <div className="setting-item">
                        <div className="setting-info">
                            <h3>Theme</h3>
                            <p>Switch between light and dark mode</p>
                        </div>
                        <button
                            className="btn btn-secondary"
                            onClick={toggleTheme}
                        >
                            {theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                        </button>
                    </div>
                </div>

                <div className="settings-section">
                    <h2>Currency</h2>
                    <div className="setting-item">
                        <div className="setting-info">
                            <h3>Currency Symbol</h3>
                            <p>Select your preferred currency symbol or enter a custom one</p>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <select
                                className="currency-select"
                                value={['$', '€', '£', 'R$', '¥'].includes(currency) ? currency : 'custom'}
                                onChange={(e) => {
                                    if (e.target.value !== 'custom') {
                                        setCurrency(e.target.value)
                                    }
                                }}
                            >
                                <option value="$">USD ($)</option>
                                <option value="€">EUR (€)</option>
                                <option value="£">GBP (£)</option>
                                <option value="R$">BRL (R$)</option>
                                <option value="¥">JPY (¥)</option>
                                <option value="custom">Custom</option>
                            </select>
                            <input
                                type="text"
                                className="currency-input"
                                value={currency}
                                onChange={(e) => setCurrency(e.target.value)}
                                placeholder="Custom"
                                style={{
                                    display: ['$', '€', '£', 'R$', '¥'].includes(currency) ? 'none' : 'block'
                                }}
                            />
                        </div>
                    </div>
                </div>

                <div className="settings-section">
                    <div className="setting-header">
                        <h2>Dashboard Layout</h2>
                        {hasChanges && (
                            <button
                                className="btn btn-primary"
                                onClick={applyChanges}
                            >
                                Apply Changes
                            </button>
                        )}
                    </div>

                    <div className="setting-item">
                        <div className="setting-info">
                            <h3>Grid Configuration</h3>
                            <p>Choose the number of columns and rows for your dashboard</p>
                        </div>
                    </div>

                    <div className="grid-options">
                        {layouts.map(layout => (
                            <button
                                key={`${layout.cols}x${layout.rows}`}
                                className={`grid-option ${pendingGrid.columns === layout.cols && pendingGrid.rows === layout.rows
                                    ? 'active'
                                    : ''
                                    }`}
                                onClick={() => handleGridSelect(layout.cols, layout.rows)}
                            >
                                <div className="grid-preview"
                                    style={{
                                        gridTemplateColumns: `repeat(${layout.cols}, 1fr)`,
                                        gridTemplateRows: `repeat(${layout.rows}, 1fr)`
                                    }}
                                >
                                    {Array.from({ length: layout.cols * layout.rows }).map((_, i) => (
                                        <div key={i} className="grid-preview-cell" />
                                    ))}
                                </div>
                                <span>{layout.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Data Management Section */}
                <div className="settings-section">
                    <h2>Data Management</h2>

                    {/* Status Message */}
                    {importStatus.message && (
                        <div className={`import-status ${importStatus.type}`}>
                            {importStatus.type === 'loading' && <span className="spinner" />}
                            {importStatus.message}
                        </div>
                    )}

                    <div className="setting-item">
                        <div className="setting-info">
                            <h3>Export Data</h3>
                            <p>Download all your transactions, goals, and settings</p>
                        </div>
                        <div className="export-buttons">
                            <button
                                className="btn btn-secondary"
                                onClick={handleExportCSV}
                                disabled={isExporting}
                            >
                                Export CSV
                            </button>
                            <button
                                className="btn btn-secondary"
                                onClick={handleExportXLSX}
                                disabled={isExporting}
                            >
                                Export XLSX
                            </button>
                        </div>
                    </div>

                    <div className="setting-item">
                        <div className="setting-info">
                            <h3>Import Data</h3>
                            <p>Restore data from a previously exported file</p>
                        </div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".csv,.xlsx,.xls"
                            onChange={handleFileSelect}
                            style={{ display: 'none' }}
                        />
                        <button
                            className="btn btn-primary"
                            onClick={handleImportClick}
                        >
                            Import File
                        </button>
                    </div>
                </div>
            </div>

            {/* Confirmation Dialog */}
            {showConfirmDialog && (
                <div className="dialog-overlay">
                    <div className="dialog-content">
                        <h3>⚠️ Confirm Import</h3>
                        <p>This will replace all your current data with the imported data.</p>
                        {pendingImportData && (
                            <div className="import-preview">
                                <p><strong>{pendingImportData.transactions?.length || 0}</strong> transactions</p>
                                <p><strong>{pendingImportData.goals?.length || 0}</strong> goals</p>
                                <p>Currency: <strong>{pendingImportData.currency}</strong></p>
                            </div>
                        )}
                        <p className="dialog-warning">This action cannot be undone.</p>
                        <div className="dialog-actions">
                            <button className="btn btn-secondary" onClick={cancelImport}>
                                Cancel
                            </button>
                            <button className="btn btn-danger" onClick={confirmImport}>
                                Replace All Data
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .settings-section {
                    background-color: var(--bg-card);
                    border-radius: 16px;
                    padding: 24px;
                    margin-bottom: 24px;
                }
                .setting-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                }
                .settings-section h2 {
                    font-size: 18px;
                    font-weight: 600;
                    margin: 0;
                    color: var(--text-primary);
                }
                .setting-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 16px;
                }
                .setting-info h3 {
                    font-size: 16px;
                    font-weight: 500;
                    margin-bottom: 4px;
                    color: var(--text-primary);
                }
                .setting-info p {
                    font-size: 14px;
                    color: var(--text-secondary);
                }
                .grid-options {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
                    gap: 16px;
                    margin-top: 20px;
                }
                .grid-option {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 12px;
                    background: var(--bg-primary);
                    border: 2px solid transparent;
                    border-radius: 12px;
                    padding: 16px;
                    cursor: pointer;
                    transition: all 0.2s;
                    color: var(--text-secondary);
                }
                .grid-option.active {
                    border-color: var(--accent-primary);
                    background-color: var(--bg-hover);
                    color: var(--text-primary);
                }
                .grid-preview {
                    display: grid;
                    gap: 2px;
                    width: 100%;
                    aspect-ratio: 4/3;
                    background-color: var(--bg-sidebar);
                    padding: 4px;
                    border-radius: 6px;
                }
                .grid-preview-cell {
                    background-color: var(--bg-card);
                    border-radius: 2px;
                }
                .grid-option.active .grid-preview-cell {
                    background-color: var(--accent-primary);
                    opacity: 0.5;
                }
                .currency-select, .currency-input {
                    background-color: var(--bg-primary);
                    color: var(--text-primary);
                    border: 1px solid var(--border-color, rgba(255,255,255,0.1));
                    border-radius: 8px;
                    padding: 8px 12px;
                    font-size: 14px;
                    outline: none;
                }
                .currency-select:focus, .currency-input:focus {
                    border-color: var(--accent-primary);
                }

                /* Data Management Styles */
                .export-buttons {
                    display: flex;
                    gap: 8px;
                }
                .import-status {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 12px 16px;
                    border-radius: 8px;
                    margin-bottom: 16px;
                    font-size: 14px;
                }
                .import-status.success {
                    background-color: rgba(97, 232, 19, 0.15);
                    color: var(--accent-green);
                    border: 1px solid rgba(97, 232, 19, 0.3);
                }
                .import-status.error {
                    background-color: rgba(255, 79, 121, 0.15);
                    color: var(--accent-red);
                    border: 1px solid rgba(255, 79, 121, 0.3);
                }
                .import-status.loading {
                    background-color: rgba(65, 105, 225, 0.15);
                    color: var(--accent-blue);
                    border: 1px solid rgba(65, 105, 225, 0.3);
                }
                .spinner {
                    width: 16px;
                    height: 16px;
                    border: 2px solid currentColor;
                    border-right-color: transparent;
                    border-radius: 50%;
                    animation: spin 0.8s linear infinite;
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }

                /* Dialog Styles */
                .dialog-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-color: rgba(0, 0, 0, 0.6);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                    backdrop-filter: blur(4px);
                }
                .dialog-content {
                    background-color: var(--bg-card);
                    border-radius: 16px;
                    padding: 24px;
                    max-width: 400px;
                    width: 90%;
                    animation: dialogSlideIn 0.2s ease;
                }
                @keyframes dialogSlideIn {
                    from {
                        opacity: 0;
                        transform: translateY(-20px) scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }
                .dialog-content h3 {
                    margin: 0 0 12px 0;
                    font-size: 18px;
                    color: var(--text-primary);
                }
                .dialog-content p {
                    margin: 0 0 16px 0;
                    font-size: 14px;
                    color: var(--text-secondary);
                    line-height: 1.5;
                }
                .import-preview {
                    background-color: var(--bg-primary);
                    border-radius: 8px;
                    padding: 12px 16px;
                    margin-bottom: 16px;
                }
                .import-preview p {
                    margin: 4px 0;
                    color: var(--text-primary);
                }
                .dialog-warning {
                    color: var(--accent-red) !important;
                    font-weight: 500;
                }
                .dialog-actions {
                    display: flex;
                    gap: 12px;
                    justify-content: flex-end;
                }
                .btn-danger {
                    background-color: var(--accent-red);
                    color: white;
                }
                .btn-danger:hover {
                    background-color: #e63e65;
                }
            `}</style>
        </div>
    )
}

export default Settings
