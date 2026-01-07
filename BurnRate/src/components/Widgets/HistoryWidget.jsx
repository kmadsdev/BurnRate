import WidgetContainer from './WidgetContainer'
import { LineChart } from '../Charts'
import { useData } from '../../context/DataContext'
import { getMonthlyAggregates, predictNext } from '../../utils/calculations'

function HistoryWidget() {
    const { transactions } = useData()

    // Get actual monthly data
    const monthlyData = getMonthlyAggregates(transactions, 6)

    // Get predictions (3 months)
    const predictions = predictNext(monthlyData, 4)

    // Combine for chart
    const incomeData = [
        ...monthlyData.map(m => ({ month: m.month, value: m.income, predicted: false })),
        ...predictions.map(p => ({ month: p.month, value: p.income, predicted: true }))
    ]

    const outcomeData = [
        ...monthlyData.map(m => ({ month: m.month, value: m.expense, predicted: false })),
        ...predictions.map(p => ({ month: p.month, value: p.expense, predicted: true }))
    ]

    const timeline = [...monthlyData.map(m => m.month), ...predictions.map(p => p.month)]

    return (
        <WidgetContainer
            id="history"
            title="History"
            size="2x1"
            periodOptions={['3 months', '6 months', '12 months']}
            defaultPeriod="6 months"
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
                    />
                </div>
            </div>
        </WidgetContainer>
    )
}

export default HistoryWidget
