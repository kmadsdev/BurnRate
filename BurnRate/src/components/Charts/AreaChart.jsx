import { useState, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useChartDimensions } from '../../hooks/useChartDimensions'

function AreaChart({
    points,
    width = 200,
    height = 100,
    strokeColor = '#FF4F79',
    fillColor = 'rgba(255, 79, 121, 0.2)',
    strokeWidth = 3,
    data = null // Optional: full data with labels for tooltips
}) {
    const [tooltip, setTooltip] = useState(null)
    const [containerRef, dimensions] = useChartDimensions()
    const { width: containerWidth, height: containerHeight } = dimensions

    // Use container dimensions if available, otherwise fallback to props
    const chartWidth = containerWidth || width
    const chartHeight = containerHeight || height

    if (!points || points.length === 0) return null

    // Add padding to prevent clipping of points
    const paddingX = 10
    const paddingY = 10
    // Prevent errors if dimensions are 0
    if (chartWidth <= 0 || chartHeight <= 0) return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />

    const innerWidth = chartWidth - paddingX * 2
    const innerHeight = chartHeight - paddingY * 2

    // Normalize points to fit in the SVG viewBox with padding
    const normalizedPoints = points.map(p => ({
        x: paddingX + (p.x / 100) * innerWidth,
        y: paddingY + innerHeight - (p.y / 100) * innerHeight,
        originalY: p.value || p.y, // Use value if available, else y (fallback)
        label: p.label
    }))

    // Create the line path
    const linePath = normalizedPoints
        .map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`))
        .join(' ')

    // Create the area path (line + close to bottom)
    const areaPath = `${linePath} L ${normalizedPoints[normalizedPoints.length - 1].x} ${chartHeight - paddingY} L ${normalizedPoints[0].x} ${chartHeight - paddingY} Z`

    const gradientId = `area-gradient-${Math.random().toString(36).substr(2, 9)}`

    const handleMouseEnter = (e, point, index) => {
        const rect = e.target.getBoundingClientRect()

        setTooltip({
            x: rect.left + rect.width / 2,
            y: rect.top,
            value: point.originalY,
            label: point.label,
            index
        })
    }

    const handleMouseLeave = () => {
        setTooltip(null)
    }

    return (
        <div className="area-chart" ref={containerRef} style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
            <svg width={chartWidth} height={chartHeight} viewBox={`0 0 ${chartWidth} ${chartHeight}`} preserveAspectRatio="none" style={{ display: 'block' }}>
                <defs>
                    <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor={strokeColor} stopOpacity="0.4" />
                        <stop offset="100%" stopColor={strokeColor} stopOpacity="0" />
                    </linearGradient>
                </defs>

                {/* Grid lines (vertical) */}
                {normalizedPoints.map((p, i) => (
                    <line
                        key={`grid-${i}`}
                        x1={p.x}
                        y1={0}
                        x2={p.x}
                        y2={chartHeight}
                        stroke="var(--chart-grid)"
                        strokeWidth="1"
                        strokeDasharray="2 2"
                        opacity="0.3"
                    />
                ))}

                {/* Area fill */}
                <path
                    d={areaPath}
                    fill={`url(#${gradientId})`}
                />

                {/* Line stroke */}
                <path
                    d={linePath}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />

                {/* Interactive data points */}
                {normalizedPoints.map((p, i) => (
                    <circle
                        key={i}
                        cx={p.x}
                        cy={p.y}
                        r={5}
                        fill={strokeColor}
                        stroke="white"
                        strokeWidth="2"
                        className="chart-data-point"
                        style={{ cursor: 'pointer' }}
                        onMouseEnter={(e) => handleMouseEnter(e, p, i)}
                        onMouseLeave={handleMouseLeave}
                    />
                ))}
            </svg>

            {/* Tooltip via Portal */}
            {tooltip && createPortal(
                <div
                    className="chart-tooltip"
                    style={{
                        position: 'fixed',
                        left: tooltip.x,
                        top: tooltip.y,
                        transform: 'translate(-50%, -100%)',
                        marginTop: '-8px',
                        zIndex: 9999
                    }}
                >
                    <div style={{ fontWeight: 600 }}>
                        {/* Format value as currency if it looks like a number */}
                        {typeof tooltip.value === 'number' ?
                            (tooltip.value >= 1000 ? `$${(tooltip.value / 1000).toFixed(1)}k` : `$${tooltip.value}`)
                            : tooltip.value}
                    </div>
                    {tooltip.label && <div style={{ opacity: 0.7, fontSize: '10px' }}>{tooltip.label}</div>}
                </div>,
                document.body
            )}
        </div>
    )
}

export default AreaChart
