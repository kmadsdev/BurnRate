import { useWidgets } from '../context/WidgetContext'
import {
    BalanceWidget,
    ExpensesWidget,
    IncomeWidget,
    HistoryWidget,
    GoalsWidget,
    ActivityWidget,
} from '../components/Widgets'

// Widget component map
const widgetComponents = {
    balance: BalanceWidget,
    expenses: ExpensesWidget,
    income: IncomeWidget,
    goals: GoalsWidget,
    history: HistoryWidget,
    activity: ActivityWidget,
}

// Widget props configuration
const widgetProps = {
    balance: {},
    expenses: { size: '1x1' },
    income: { size: '1x1' },
    goals: {},
    history: {},
    activity: { size: '2x1' },
}

function Dashboard() {
    const { widgets, resetOrder } = useWidgets()

    return (
        <div className="dashboard">
            <header className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1 className="dashboard-title">Dashboard</h1>
                <button
                    onClick={resetOrder}
                    style={{
                        padding: '8px 16px',
                        background: 'var(--bg-card)',
                        border: '1px solid var(--chart-grid)',
                        borderRadius: 'var(--radius-sm)',
                        color: 'var(--text-secondary)',
                        cursor: 'pointer',
                        fontSize: 'var(--font-size-sm)',
                        transition: 'all 0.2s ease',
                    }}
                    onMouseOver={(e) => {
                        e.target.style.background = 'var(--accent-primary)'
                        e.target.style.color = 'white'
                        e.target.style.borderColor = 'var(--accent-primary)'
                    }}
                    onMouseOut={(e) => {
                        e.target.style.background = 'var(--bg-card)'
                        e.target.style.color = 'var(--text-secondary)'
                        e.target.style.borderColor = 'var(--chart-grid)'
                    }}
                >
                    Reset Layout
                </button>
            </header>

            <div className="dashboard-grid">
                {widgets.map((widget) => {
                    const WidgetComponent = widgetComponents[widget.id]
                    const props = widgetProps[widget.id] || {}

                    if (!WidgetComponent) return null

                    return <WidgetComponent key={widget.id} {...props} />
                })}
            </div>
        </div>
    )
}

export default Dashboard
