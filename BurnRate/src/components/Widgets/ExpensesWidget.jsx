import WidgetContainer from './WidgetContainer'
import { AreaChart } from '../Charts'
import { useData } from '../../context/DataContext'
import { calculateTotalExpenses, getChartPoints, formatCurrency } from '../../utils/calculations'

const ExpensesIcon = () => (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="#FF4F79" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 12l-4 4-4-4" />
        <path d="M15 4v12" />
        <path d="M5 20h18" />
    </svg>
)

function ExpensesWidget({ size = '1x1' }) {
    const { transactions } = useData()
    const totalExpenses = calculateTotalExpenses(transactions)
    const chartPoints = getChartPoints(transactions, 'expense', 6)

    return (
        <WidgetContainer
            id="expenses"
            title="Expenses"
            size={size}
            accent="expenses"
            icon={<ExpensesIcon />}
            periodOptions={['7 days', '30 days', '90 days']}
            defaultPeriod="7 days"
        >
            <div className="widget-value-container">
                <div className="widget-value" style={{ color: 'var(--text-primary)' }}>
                    <span className="widget-value-prefix">$</span>
                    {new Intl.NumberFormat('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                    }).format(totalExpenses)}
                </div>
            </div>

            <div className="widget-chart">
                <AreaChart
                    points={chartPoints.length > 0 ? chartPoints : [{ x: 0, y: 0 }, { x: 100, y: 0 }]}
                    strokeColor="#FF4F79"
                    fillColor="rgba(255, 79, 121, 0.2)"
                    height={120}
                    width={250}
                />
            </div>
        </WidgetContainer>
    )
}

export default ExpensesWidget
