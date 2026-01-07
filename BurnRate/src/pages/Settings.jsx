import React, { useState } from 'react'
import { useTheme } from '../context/ThemeContext'
import { useWidgets } from '../context/WidgetContext'


function Settings() {
    const { theme, toggleTheme } = useTheme()
    const {
        gridLayout,
        updateGridLayout,
        widgets,
        updateWidgetsList,
        WIDGET_DEFINITIONS
    } = useWidgets()

    // Local state for pending changes
    const [pendingGrid, setPendingGrid] = useState(gridLayout)
    const [hasChanges, setHasChanges] = useState(false)

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
            </div>

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
            `}</style>
        </div>
    )
}

export default Settings
