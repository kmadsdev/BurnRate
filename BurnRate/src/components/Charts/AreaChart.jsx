import { useState, useRef } from 'react'

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
    const chartRef = useRef(null)

    if (!points || points.length === 0) return null

    // Normalize points to fit in the SVG viewBox
    const normalizedPoints = points.map(p => ({
        x: (p.x / 100) * width,
        y: height - (p.y / 100) * height,
        originalY: p.y,
    }))

    // Create the line path
    const linePath = normalizedPoints
        .map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`))
        .join(' ')

    // Create the area path (line + close to bottom)
    const areaPath = `${linePath} L ${normalizedPoints[normalizedPoints.length - 1].x} ${height} L ${normalizedPoints[0].x} ${height} Z`

    const gradientId = `area-gradient-${Math.random().toString(36).substr(2, 9)}`

    const handleMouseEnter = (e, point, index) => {
        if (!chartRef.current) return
        const rect = e.target.getBoundingClientRect()
        const containerRect = chartRef.current.getBoundingClientRect()

        setTooltip({
            x: rect.left - containerRect.left + rect.width / 2,
            y: rect.top - containerRect.top,
            value: point.originalY,
            index
        })
    }

    const handleMouseLeave = () => {
        setTooltip(null)
    }

    return (
        <div className="area-chart" ref={chartRef} style={{ position: 'relative' }}>
            <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
                <defs>
                    <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor={strokeColor} stopOpacity="0.4" />
                        <stop offset="100%" stopColor={strokeColor} stopOpacity="0" />
                    </linearGradient>
                </defs>

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

            {/* Tooltip */}
            {tooltip && (
                <div
                    className="chart-tooltip"
                    style={{
                        left: tooltip.x,
                        top: tooltip.y,
                    }}
                >
                    <div style={{ fontWeight: 600 }}>{tooltip.value}%</div>
                </div>
            )}
        </div>
    )
}

export default AreaChart
