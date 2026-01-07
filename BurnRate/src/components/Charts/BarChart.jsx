import { useState } from 'react'
import { createPortal } from 'react-dom'
import { formatCurrency } from '../../utils/calculations'

function BarChart({ data, height = 100, barColor = 'rgba(255, 255, 255, 0.64)' }) {
    const [tooltip, setTooltip] = useState(null)

    if (!data || data.length === 0) return null

    const maxValue = Math.max(...data.map(d => d.value))

    const handleMouseEnter = (e, item, index) => {
        const rect = e.target.getBoundingClientRect()
        setTooltip({
            x: rect.left + rect.width / 2,
            y: rect.top,
            day: item.day,
            value: item.value
        })
    }

    const handleMouseLeave = () => {
        setTooltip(null)
    }

    // Dynamic gap based on data length to prevent overflow
    const gap = data.length > 50 ? '1px' : data.length > 20 ? '2px' : '4px'

    return (
        <div className="bar-chart" style={{ height, position: 'relative', gap }}>
            {data.map((item, index) => (
                <div
                    key={index}
                    className="bar-chart-bar"
                    style={{
                        height: `${(item.value / maxValue) * 100}%`,
                        backgroundColor: barColor,
                        borderRadius: data.length > 30 ? '1px' : '4px', // Smaller radius for thin bars
                    }}
                    onMouseEnter={(e) => handleMouseEnter(e, item, index)}
                    onMouseLeave={handleMouseLeave}
                />
            ))}

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
                    <div style={{ fontWeight: 600 }}>{formatCurrency(tooltip.value)}</div>
                    <div style={{ opacity: 0.7, fontSize: '10px' }}>{tooltip.day}</div>
                </div>,
                document.body
            )}
        </div>
    )
}

export default BarChart
