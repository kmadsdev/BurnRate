import WidgetContainer from './WidgetContainer'
import { useData } from '../../context/DataContext'
import { getCategoryBreakdown } from '../../utils/calculations'

function DonutChart({ data, size = 140 }) {
    if (!data || data.length === 0) {
        return (
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={(size - 24) / 2}
                    fill="none"
                    stroke="rgba(0,0,0,0.1)"
                    strokeWidth={24}
                />
            </svg>
        )
    }

    const total = data.reduce((sum, item) => sum + item.value, 0)
    const strokeWidth = 24
    const radius = (size - strokeWidth) / 2
    const circumference = 2 * Math.PI * radius

    let currentOffset = 0

    return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
            {data.map((item, index) => {
                const percentage = item.value / total
                const dashArray = circumference * percentage
                const offset = currentOffset
                currentOffset += dashArray + 2 // gap between segments

                return (
                    <circle
                        key={index}
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="none"
                        stroke={item.color}
                        strokeWidth={strokeWidth}
                        strokeDasharray={`${dashArray - 2} ${circumference}`}
                        strokeDashoffset={-offset}
                        strokeLinecap="round"
                    />
                )
            })}
        </svg>
    )
}

function ActivityWidget({ size = '1x1' }) {
    const { transactions } = useData()
    const categoryData = getCategoryBreakdown(transactions, 'expense')

    return (
        <WidgetContainer
            id="activity"
            title="Activity"
            size={size}
            periodOptions={['This week', 'This month', '3 months']}
            defaultPeriod="This month"
        >
            <div className="activity-widget">
                <div className="activity-chart-container">
                    <DonutChart data={categoryData} size={140} />

                    <div className="activity-legend">
                        {categoryData.length > 0 ? (
                            categoryData.slice(0, 5).map((category, index) => (
                                <div key={index} className="activity-legend-item">
                                    <span
                                        className="activity-legend-color"
                                        style={{ backgroundColor: category.color }}
                                    />
                                    <span>{category.name}</span>
                                    <span style={{ marginLeft: 'auto', color: 'var(--text-muted)' }}>
                                        {category.value}%
                                    </span>
                                </div>
                            ))
                        ) : (
                            <div className="activity-legend-item">
                                <span>No expense data</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </WidgetContainer>
    )
}

export default ActivityWidget
