import { useState, useMemo } from 'react'
import WidgetContainer from './WidgetContainer'
import { LineChart } from '../Charts'
import { useData } from '../../context/DataContext'
import { getMonthlyAggregates, predictNext } from '../../utils/calculations'

const periodToMonths = {
    '3 months': 3,
    '6 months': 6,
    '12 months': 12,
}

function HistoryWidget({ size = '2x1' }) {
    const { transactions, currency } = useData()
    const [period, setPeriod] = useState('6 months')

    const { incomeData, outcomeData, timeline } = useMemo(() => {
        const months = periodToMonths[period] || 6

        // Get actual monthly data
        const monthlyData = getMonthlyAggregates(transactions, months)

        // Get predictions (based on period)
        const predictionMonths = Math.ceil(months / 2)
        const predictions = predictNext(monthlyData, predictionMonths)

        // Combine for chart
        const income = [
            ...monthlyData.map(m => ({ month: m.month, value: m.income, predicted: false })),
            ...predictions.map(p => ({ month: p.month, value: p.income, predicted: true }))
        ]

        const outcome = [
            ...monthlyData.map(m => ({ month: m.month, value: m.expense, predicted: false })),
            ...predictions.map(p => ({ month: p.month, value: p.expense, predicted: true }))
        ]

        const tl = [...monthlyData.map(m => m.month), ...predictions.map(p => p.month)]

        return { incomeData: income, outcomeData: outcome, timeline: tl }
    }, [transactions, period])

    return (
        <WidgetContainer
            id="history"
            title="History"
            size={size}
            periodOptions={['3 months', '6 months', '12 months']}
            defaultPeriod={period}
            onPeriodChange={setPeriod}
            showPeriodSelector={true}
        >
            <div className="history-widget">
                <div className="history-legend">
                    <div className="history-legend-item">
                        <span className="history-legend-dot income"></span>
                        <span>Income</span>
                    </div>
                    <div className="history-legend-item">
                        <span className="history-legend-dot outcome"></span>
                        <span>Outcome</span>
                    </div>
                </div>

                <div className="history-chart-container">
                    <LineChart
                        incomeData={incomeData}
                        outcomeData={outcomeData}
                        labels={['2k', '4k', '6k', '8k', '10k']}
                        timeline={timeline}
                        width={550}
                        height={220}
                        currency={currency}
                    />
                </div>
            </div>
        </WidgetContainer>
    )
}

export default HistoryWidget
