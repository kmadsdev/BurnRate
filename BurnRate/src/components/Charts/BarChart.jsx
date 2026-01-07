function BarChart({ data, height = 100, barColor = 'rgba(255, 255, 255, 0.64)' }) {
    if (!data || data.length === 0) return null

    const maxValue = Math.max(...data.map(d => d.value))

    return (
        <div className="bar-chart" style={{ height }}>
            {data.map((item, index) => (
                <div
                    key={index}
                    className="bar-chart-bar"
                    style={{
                        height: `${(item.value / maxValue) * 100}%`,
                        backgroundColor: barColor,
                    }}
                    title={`${item.day}: ${item.value}`}
                />
            ))}
        </div>
    )
}

export default BarChart
