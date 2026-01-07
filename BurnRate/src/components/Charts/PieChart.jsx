function PieChart({
    percentage = 0,
    size = 100,
    strokeWidth = 8,
    color = '#4169E1',
    backgroundColor = 'rgba(0, 0, 0, 0.1)',
    showLabel = true,
    label = '',
    value = ''
}) {
    const radius = (size - strokeWidth) / 2
    const circumference = 2 * Math.PI * radius
    const offset = circumference - (percentage / 100) * circumference

    return (
        <div className="pie-chart" style={{ width: size, height: size }}>
            <svg
                className="pie-chart-svg"
                width={size}
                height={size}
                viewBox={`0 0 ${size} ${size}`}
                style={{ display: 'block' }}
            >
                {/* Background circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={backgroundColor}
                    strokeWidth={strokeWidth}
                />

                {/* Progress circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={color}
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    style={{
                        transition: 'stroke-dashoffset 0.5s ease-in-out',
                    }}
                />
            </svg>

            {showLabel && (
                <div className="pie-chart-label">
                    {value && <div className="pie-chart-value">{value}</div>}
                    {label && <div className="pie-chart-text">{label}</div>}
                </div>
            )}
        </div>
    )
}

export default PieChart
