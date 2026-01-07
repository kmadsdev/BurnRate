import { useState } from 'react'

function LineChart({
    incomeData,
    outcomeData,
    width = 600,
    height = 200,
    labels = ['2k', '4k', '6k', '8k', '10k'],
    timeline = []
}) {
    const [tooltip, setTooltip] = useState(null)

    if (!incomeData || !outcomeData) return null

    const maxValue = 10000 // Fixed max for the chart
    const padding = { top: 20, right: 20, bottom: 40, left: 50 }
    const chartWidth = width - padding.left - padding.right
    const chartHeight = height - padding.top - padding.bottom

    // Convert data points to SVG coordinates
    const getX = (index, total) => padding.left + (index / (total - 1)) * chartWidth
    const getY = (value) => padding.top + chartHeight - (value / maxValue) * chartHeight

    // Create path for income line
    const createPath = (data) => {
        return data
            .map((d, i) => {
                const x = getX(i, data.length)
                const y = getY(d.value)
                return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`
            })
            .join(' ')
    }

    // Split data into actual and predicted
    const incomeSolid = incomeData.filter(d => !d.predicted)
    const incomePredicted = incomeData.filter(d => d.predicted)
    const outcomeSolid = outcomeData.filter(d => !d.predicted)
    const outcomePredicted = outcomeData.filter(d => d.predicted)

    // Add last solid point to predicted for continuity
    const incomeAllPredicted = incomeSolid.length > 0 && incomePredicted.length > 0
        ? [incomeSolid[incomeSolid.length - 1], ...incomePredicted]
        : incomePredicted
    const outcomeAllPredicted = outcomeSolid.length > 0 && outcomePredicted.length > 0
        ? [outcomeSolid[outcomeSolid.length - 1], ...outcomePredicted]
        : outcomePredicted

    // Calculate path with proper indices
    const createSolidPath = (data, startIndex = 0) => {
        return data
            .map((d, i) => {
                const x = getX(startIndex + i, incomeData.length)
                const y = getY(d.value)
                return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`
            })
            .join(' ')
    }

    const createPredictedPath = (data, solidLength) => {
        return data
            .map((d, i) => {
                const actualIndex = i === 0 ? solidLength - 1 : solidLength + i - 1
                const x = getX(actualIndex, incomeData.length)
                const y = getY(d.value)
                return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`
            })
            .join(' ')
    }

    const handleMouseEnter = (e, dataPoint, type, index) => {
        const rect = e.target.getBoundingClientRect()
        const containerRect = e.target.closest('.line-chart').getBoundingClientRect()
        setTooltip({
            x: rect.left - containerRect.left + rect.width / 2,
            y: rect.top - containerRect.top,
            value: dataPoint.value,
            month: dataPoint.month,
            type,
            predicted: dataPoint.predicted
        })
    }

    const handleMouseLeave = () => {
        setTooltip(null)
    }

    const formatValue = (value) => {
        if (value >= 1000) {
            return `$${(value / 1000).toFixed(1)}k`
        }
        return `$${value}`
    }

    return (
        <div className="line-chart" style={{ position: 'relative' }}>
            <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet">
                {/* Grid lines */}
                {labels.map((label, i) => {
                    const y = padding.top + (chartHeight / (labels.length - 1)) * (labels.length - 1 - i)
                    return (
                        <g key={i}>
                            <line
                                x1={padding.left}
                                y1={y}
                                x2={width - padding.right}
                                y2={y}
                                stroke="var(--chart-grid)"
                                strokeWidth="0.5"
                            />
                            <text
                                x={padding.left - 10}
                                y={y + 4}
                                textAnchor="end"
                                fill="var(--text-muted)"
                                fontSize="11"
                            >
                                {label}
                            </text>
                        </g>
                    )
                })}

                {/* Timeline labels */}
                {timeline.map((label, i) => {
                    const x = getX(i, timeline.length)
                    return (
                        <text
                            key={i}
                            x={x}
                            y={height - 10}
                            textAnchor="middle"
                            fill="var(--text-muted)"
                            fontSize="11"
                        >
                            {label}
                        </text>
                    )
                })}

                {/* Income line - solid */}
                <path
                    d={createSolidPath(incomeSolid)}
                    fill="none"
                    stroke="var(--accent-primary)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />

                {/* Income line - predicted (dashed) */}
                {incomeAllPredicted.length > 1 && (
                    <path
                        d={createPredictedPath(incomeAllPredicted, incomeSolid.length)}
                        fill="none"
                        stroke="var(--accent-primary)"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeDasharray="4 4"
                    />
                )}

                {/* Outcome line - solid */}
                <path
                    d={createSolidPath(outcomeSolid)}
                    fill="none"
                    stroke="var(--accent-expenses)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />

                {/* Outcome line - predicted (dashed) */}
                {outcomeAllPredicted.length > 1 && (
                    <path
                        d={createPredictedPath(outcomeAllPredicted, outcomeSolid.length)}
                        fill="none"
                        stroke="var(--accent-expenses)"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeDasharray="4 4"
                    />
                )}

                {/* Income data points - interactive */}
                {incomeData.map((d, i) => {
                    const x = getX(i, incomeData.length)
                    const y = getY(d.value)
                    return (
                        <circle
                            key={`income-${i}`}
                            cx={x}
                            cy={y}
                            r={4}
                            fill="var(--accent-primary)"
                            stroke="white"
                            strokeWidth="2"
                            className="chart-data-point"
                            style={{ cursor: 'pointer' }}
                            onMouseEnter={(e) => handleMouseEnter(e, d, 'Income', i)}
                            onMouseLeave={handleMouseLeave}
                        />
                    )
                })}

                {/* Outcome data points - interactive */}
                {outcomeData.map((d, i) => {
                    const x = getX(i, outcomeData.length)
                    const y = getY(d.value)
                    return (
                        <circle
                            key={`outcome-${i}`}
                            cx={x}
                            cy={y}
                            r={4}
                            fill="var(--accent-expenses)"
                            stroke="white"
                            strokeWidth="2"
                            className="chart-data-point"
                            style={{ cursor: 'pointer' }}
                            onMouseEnter={(e) => handleMouseEnter(e, d, 'Outcome', i)}
                            onMouseLeave={handleMouseLeave}
                        />
                    )
                })}
            </svg>

            {/* Tooltip */}
            {tooltip && (
                <div
                    className="chart-tooltip"
                    style={{
                        left: tooltip.x,
                        top: tooltip.y,
                    }}
                >
                    <div style={{ fontWeight: 600 }}>{formatValue(tooltip.value)}</div>
                    <div style={{ opacity: 0.7, fontSize: '10px' }}>
                        {tooltip.type} • {tooltip.month}
                        {tooltip.predicted && ' (Predicted)'}
                    </div>
                </div>
            )}
        </div>
    )
}

export default LineChart
