import { useState, useMemo } from 'react'
import WidgetContainer from './WidgetContainer'
import { AreaChart } from '../Charts'
import { useData } from '../../context/DataContext'
import { calculateTotalIncome, getChartPoints, filterByPeriod, parsePeriodToDays } from '../../utils/calculations'

const IncomeIcon = () => (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="#61E813" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 16l4-4 4 4" />
        <path d="M13 24V12" />
        <path d="M5 8h18" />
    </svg>
)

function IncomeWidget({ size = '1x1' }) {
    const { transactions, currency } = useData()
    const [period, setPeriod] = useState('7 days')

    const { totalIncome, chartPoints } = useMemo(() => {
        const filtered = filterByPeriod(transactions, period)
        const days = parsePeriodToDays(period)
        return {
            totalIncome: calculateTotalIncome(filtered),
            chartPoints: getChartPoints(transactions, 'income', days)
        }
    }, [transactions, period])

    return (
        <WidgetContainer
            id="income"
            title="Income"
            size={size}
            accent="income"
            icon={<IncomeIcon />}
            periodOptions={['7 days', '30 days', '90 days']}
            defaultPeriod={period}
            onPeriodChange={setPeriod}
        >
            <div className="widget-value-container">
                <div className="widget-value" style={{ color: 'var(--text-primary)' }}>
                    <span className="widget-value-prefix">{currency}</span>
                    {new Intl.NumberFormat('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                    }).format(totalIncome)}
                </div>
            </div>

            <div className="widget-chart">
                <AreaChart
                    points={chartPoints.length > 1 ? chartPoints : [{ x: 0, y: 0 }, { x: 100, y: 0 }]}
                    strokeColor="#61E813"
                    fillColor="rgba(97, 232, 19, 0.2)"
                    height={120}
                    width={250}
                    currency={currency}
                />
            </div>
        </WidgetContainer>
    )
}

export default IncomeWidget
