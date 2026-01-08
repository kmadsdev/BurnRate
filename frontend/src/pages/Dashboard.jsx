import { useWidgets, WIDGET_DEFINITIONS } from '../context/WidgetContext'
import {
    BalanceWidget,
    ExpensesWidget,
    IncomeWidget,
    HistoryWidget,
    GoalsWidget,
    ActivityWidget,
    SubscriptionsWidget,
} from '../components/Widgets'

// Widget component map
const widgetComponents = {
    balance: BalanceWidget,
    expenses: ExpensesWidget,
    income: IncomeWidget,
    goals: GoalsWidget,
    history: HistoryWidget,
    activity: ActivityWidget,
    subscriptions: SubscriptionsWidget,
}

const EditIcon = () => (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 3.75h6.75" />
        <path d="M9 9h6.75" />
        <path d="M9 14.25h6.75" />
        <rect x="2.25" y="2.25" width="3" height="3" rx="0.5" />
        <rect x="2.25" y="7.5" width="3" height="3" rx="0.5" />
        <rect x="2.25" y="12.75" width="3" height="3" rx="0.5" />
    </svg>
)

const CheckIcon = () => (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 4.5L6.75 12.75L3 9" />
    </svg>
)

const PlusIcon = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M8 3v10M3 8h10" />
    </svg>
)

function Dashboard() {
    const {
        widgets,
        editMode,
        toggleEditMode,
        addWidget,
        getAvailableWidgets,
        resetToDefaults,
        gridLayout,
        handleDragOver,
        handleDrop,
        handleDragLeave,
        draggedWidget,
        dragOverWidget
    } = useWidgets()

    const availableWidgets = getAvailableWidgets()

    // Calculate empty spots
    const totalSlots = gridLayout.columns * gridLayout.rows
    // This is a simplification. Real grid logic with different sized widgets is complex.
    // For now, we'll assume flow layout for main widgets and just fill the rest with empty spots
    // to reach the target visual grid, although CSS Grid auto-placement handles the flow.
    // The requirement says "unused widget spots should have a marked empty spot".

    // We need to count how many "1x1" equivalent slots are used.
    const usedSlots = widgets.reduce((acc, widget) => {
        const [w, h] = widget.size.split('x').map(Number)
        return acc + (w * h)
    }, 0)

    const displayEmptySlots = Math.max(0, totalSlots - usedSlots)

    return (
        <div className="dashboard">
            <header className="dashboard-header">
                <h1 className="dashboard-title">Dashboard</h1>
                <div className="dashboard-actions">
                    {editMode && (
                        <button
                            onClick={resetToDefaults}
                            className="btn btn-secondary"
                        >
                            Reset to Defaults
                        </button>
                    )}
                    <button
                        onClick={toggleEditMode}
                        className={`btn ${editMode ? 'btn-primary' : 'btn-secondary'}`}
                    >
                        {editMode ? (
                            <>
                                <CheckIcon />
                                <span>Done</span>
                            </>
                        ) : (
                            <>
                                <EditIcon />
                                <span>Edit Layout</span>
                            </>
                        )}
                    </button>
                </div>
            </header>

            {/* Available widgets panel - only shown in edit mode */}
            {editMode && availableWidgets.length > 0 && (
                <div className="available-widgets-panel">
                    <h3 className="available-widgets-title">Available Widgets</h3>
                    <div className="available-widgets-list">
                        {availableWidgets.map(widget => (
                            <button
                                key={widget.id}
                                className="available-widget-item"
                                onClick={() => addWidget(widget.id)}
                            >
                                <PlusIcon />
                                <span>{widget.name}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <div
                className="dashboard-grid"
                style={{
                    gridTemplateColumns: `repeat(${gridLayout.columns}, minmax(0, 1fr))`,
                    gridTemplateRows: `repeat(${gridLayout.rows}, minmax(var(--widget-min-height), 1fr))`
                }}
            >
                {widgets.map((widget) => {
                    // Handle placeholders
                    if (widget.isPlaceholder) {
                        return (
                            <div
                                key={widget.id}
                                className={`widget-empty ${editMode ? 'interactive' : ''} ${dragOverWidget === widget.id ? 'drag-over' : ''}`}
                                onDragOver={(e) => {
                                    if (!editMode || !draggedWidget) return
                                    e.preventDefault()
                                    handleDragOver(widget.id)
                                }}
                                onDrop={(e) => {
                                    if (!editMode || !draggedWidget) return
                                    e.preventDefault()
                                    handleDrop(widget.id)
                                }}
                                onDragLeave={(e) => {
                                    if (!editMode) return
                                    e.preventDefault()
                                    handleDragLeave()
                                }}
                            >
                                {editMode ? (
                                    <div className="widget-empty-content">
                                        <PlusIcon />
                                        <span>Add Widget</span>
                                    </div>
                                ) : (
                                    <svg width="100%" height="100%" style={{ opacity: 0.5, display: 'block' }}>
                                        <defs>
                                            <pattern id={`empty-pattern-${widget.id}`} x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                                                <line x1="0" y1="0" x2="0" y2="40" stroke="var(--chart-grid)" strokeWidth="1" />
                                            </pattern>
                                        </defs>
                                        <rect width="100%" height="100%" fill={`url(#empty-pattern-${widget.id})`} />
                                    </svg>
                                )}
                            </div>
                        )
                    }

                    const WidgetComponent = widgetComponents[widget.id]
                    if (!WidgetComponent) return null

                    return <WidgetComponent key={widget.id} size={widget.size} />
                })}
            </div>

            <style>{`
                .widget-empty {
                    background-color: var(--bg-card);
                    border-radius: var(--radius-lg);
                    height: 100%;
                    width: 100%;
                    min-height: var(--widget-min-height);
                    opacity: 0.3;
                    border: 2px dashed var(--chart-grid);
                    position: relative;
                    overflow: hidden;
                }
                .widget-empty.interactive {
                    background-color: var(--bg-primary);
                    opacity: 0.8;
                    border-color: var(--border-color);
                    border-style: dashed;
                    cursor: default;
                }
                .widget-empty.drag-over {
                    background-color: var(--bg-card-hover);
                    border-color: var(--primary);
                    opacity: 1;
                }
                .widget-empty-content {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    height: 100%;
                    gap: 8px;
                    color: var(--text-secondary);
                    font-size: 14px;
                }
            `}</style>
        </div>
    )
}

export default Dashboard
