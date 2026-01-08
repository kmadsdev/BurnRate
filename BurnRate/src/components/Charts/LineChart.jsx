import { useState } from 'react'
import { createPortal } from 'react-dom'
import { useChartDimensions } from '../../hooks/useChartDimensions'

function LineChart({
    incomeData,
    outcomeData,
    width = 600,
    height = 200,
    labels = ['2k', '4k', '6k', '8k', '10k'],
    timeline = [],
    currency = '$'
}) {
    const [tooltip, setTooltip] = useState(null)
    const [containerRef, dimensions] = useChartDimensions()
    const { width: containerWidth, height: containerHeight } = dimensions

    // Use container dimensions if available, otherwise fallback to props
    const chartWidth = containerWidth || width
    const chartHeight = containerHeight || height

    if (!incomeData || !outcomeData) return null

    const maxValue = 10000 // Fixed max for the chart
    const padding = { top: 30, right: 30, bottom: 40, left: 50 }

    // Internal drawing area dimensions
    const drawWidth = chartWidth - padding.left - padding.right
    const drawHeight = chartHeight - padding.top - padding.bottom

    // Prevent errors if dimensions are 0
    if (drawWidth <= 0 || drawHeight <= 0) return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />

    // Convert data points to SVG coordinates
    const getX = (index, total) => padding.left + (index / (total - 1)) * drawWidth
    const getY = (value) => padding.top + drawHeight - (value / maxValue) * drawHeight

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

    // Create closed area path for gradient fills
    const createAreaPath = (data, totalLength) => {
        if (data.length === 0) return ''
        const baseline = padding.top + drawHeight
        const firstX = getX(0, totalLength)
        const lastX = getX(data.length - 1, totalLength)

        const linePath = data
            .map((d, i) => {
                const x = getX(i, totalLength)
                const y = getY(d.value)
                return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`
            })
            .join(' ')

        return `${linePath} L ${lastX} ${baseline} L ${firstX} ${baseline} Z`
    }

    // Create area path for predicted section
    const createPredictedAreaPath = (predictedData, solidLength, totalLength) => {
        if (predictedData.length < 2) return ''
        const baseline = padding.top + drawHeight

        const linePath = predictedData
            .map((d, i) => {
                const actualIndex = i === 0 ? solidLength - 1 : solidLength + i - 1
                const x = getX(actualIndex, totalLength)
                const y = getY(d.value)
                return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`
            })
            .join(' ')

        const lastIndex = solidLength + predictedData.length - 2
        const firstIndex = solidLength - 1
        const lastX = getX(lastIndex, totalLength)
        const firstX = getX(firstIndex, totalLength)

        return `${linePath} L ${lastX} ${baseline} L ${firstX} ${baseline} Z`
    }

    const handleMouseEnter = (e, dataPoint, type, index) => {
        const rect = e.target.getBoundingClientRect()
        setTooltip({
            x: rect.left + rect.width / 2,
            y: rect.top, // Position above the dot relative to viewport
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
            return `${currency}${(value / 1000).toFixed(1)}k`
        }
        return `${currency}${value}`
    }

    return (
        <div className="line-chart" ref={containerRef} style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
            <svg width={chartWidth} height={chartHeight} viewBox={`0 0 ${chartWidth} ${chartHeight}`} style={{ display: 'block' }}>
                {/* Gradient definitions for area fills */}
                <defs>
                    <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#4169E1" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#4169E1" stopOpacity="0.05" />
                    </linearGradient>
                    <linearGradient id="incomePredictedGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#4169E1" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="#4169E1" stopOpacity="0.02" />
                    </linearGradient>
                    <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#FF4F79" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#FF4F79" stopOpacity="0.05" />
                    </linearGradient>
                    <linearGradient id="expensePredictedGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#FF4F79" stopOpacity="0.15" />
                        <stop offset="100%" stopColor="#FF4F79" stopOpacity="0.02" />
                    </linearGradient>
                </defs>

                {/* Grid lines */}
                {labels.map((label, i) => {
                    const y = padding.top + (drawHeight / (labels.length - 1)) * (labels.length - 1 - i)
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

                {/* Area fills with gradients */}
                <path
                    d={createAreaPath(incomeData.filter(d => !d.predicted), incomeData.length)}
                    fill="url(#incomeGradient)"
                    stroke="none"
                />
                <path
                    d={createAreaPath(outcomeData.filter(d => !d.predicted), outcomeData.length)}
                    fill="url(#expenseGradient)"
                    stroke="none"
                />

                {/* Predicted area fills (lighter) */}
                {incomeAllPredicted.length > 1 && (
                    <path
                        d={createPredictedAreaPath(incomeAllPredicted, incomeSolid.length, incomeData.length)}
                        fill="url(#incomePredictedGradient)"
                        stroke="none"
                    />
                )}
                {outcomeAllPredicted.length > 1 && (
                    <path
                        d={createPredictedAreaPath(outcomeAllPredicted, outcomeSolid.length, outcomeData.length)}
                        fill="url(#expensePredictedGradient)"
                        stroke="none"
                    />
                )}

                {/* Prediction divider line */}
                {incomeSolid.length > 0 && incomeAllPredicted.length > 1 && (
                    <line
                        x1={getX(incomeSolid.length - 1, incomeData.length)}
                        y1={padding.top}
                        x2={getX(incomeSolid.length - 1, incomeData.length)}
                        y2={padding.top + drawHeight}
                        stroke="var(--chart-grid)"
                        strokeWidth="1"
                        strokeDasharray="4 4"
                    />
                )}

                {/* Income line - solid */}
                <path
                    d={createSolidPath(incomeSolid)}
                    fill="none"
                    stroke="#4169E1"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />

                {/* Income line - predicted (dashed) */}
                {incomeAllPredicted.length > 1 && (
                    <path
                        d={createPredictedPath(incomeAllPredicted, incomeSolid.length)}
                        fill="none"
                        stroke="#4169E1"
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
                    stroke="#FF4F79"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />

                {/* Outcome line - predicted (dashed) */}
                {outcomeAllPredicted.length > 1 && (
                    <path
                        d={createPredictedPath(outcomeAllPredicted, outcomeSolid.length)}
                        fill="none"
                        stroke="#FF4F79"
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
                            fill="#4169E1"
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
                            fill="#FF4F79"
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

            {/* Tooltip via Portal */}
            {tooltip && createPortal(
                <div
                    className="chart-tooltip"
                    style={{
                        position: 'fixed', // Fixed positioning for portal
                        left: tooltip.x,
                        top: tooltip.y,
                        transform: 'translate(-50%, -100%)', // Centered and above
                        marginTop: '-8px',
                        zIndex: 9999
                    }}
                >
                    <div style={{ fontWeight: 600 }}>{formatValue(tooltip.value)}</div>
                    <div style={{ opacity: 0.7, fontSize: '10px' }}>
                        {tooltip.type} • {tooltip.month}
                        {tooltip.predicted && ' (Predicted)'}
                    </div>
                </div>,
                document.body
            )}
        </div>
    )
}

export default LineChart
