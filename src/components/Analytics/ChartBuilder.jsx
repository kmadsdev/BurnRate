import { useState, useMemo } from 'react'
import { useData } from '../../context/DataContext'
import { formatCurrency } from '../../utils/calculations'

const CHART_TYPES = ['bar', 'line', 'pie', 'area']

const X_AXIS_OPTIONS = [
    { value: 'category', label: 'Category' },
    { value: 'month', label: 'Month' },
    { value: 'type', label: 'Type' },
    { value: 'frequency', label: 'Frequency' },
    { value: 'company', label: 'Company' }
]

const Y_AXIS_OPTIONS = [
    { value: 'sum', label: 'Sum of Amount' },
    { value: 'avg', label: 'Average Amount' },
    { value: 'count', label: 'Count' },
    { value: 'min', label: 'Minimum' },
    { value: 'max', label: 'Maximum' }
]

const COLORS = [
    '#4169E1', '#61E813', '#FF4F79', '#FFBE0A', '#9B59B6',
    '#3498DB', '#E74C3C', '#1ABC9C', '#F39C12', '#8E44AD'
]

function ChartBuilder() {
    const { transactions, currency } = useData()

    const [config, setConfig] = useState({
        chartType: 'bar',
        xAxis: 'category',
        yAxis: 'sum',
        filter: 'all', // all, income, expense
        dateRange: 'all'
    })

    const [savedCharts, setSavedCharts] = useState(() => {
        const saved = localStorage.getItem('burnrate-saved-charts')
        return saved ? JSON.parse(saved) : []
    })

    // Calculate chart data based on config
    const chartData = useMemo(() => {
        let data = [...transactions]

        // Apply type filter
        if (config.filter !== 'all') {
            data = data.filter(t => t.type === config.filter)
        }

        // Group by x-axis
        const groups = {}
        for (const t of data) {
            let key
            if (config.xAxis === 'month') {
                const date = new Date(t.date)
                key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
            } else {
                key = t[config.xAxis] || 'Unknown'
            }

            if (!groups[key]) {
                groups[key] = []
            }
            groups[key].push(t)
        }

        // Calculate y-axis values
        const result = Object.entries(groups).map(([label, items], idx) => {
            let value
            const amounts = items.map(i => i.amount)

            switch (config.yAxis) {
                case 'sum':
                    value = amounts.reduce((a, b) => a + b, 0)
                    break
                case 'avg':
                    value = amounts.reduce((a, b) => a + b, 0) / amounts.length
                    break
                case 'count':
                    value = items.length
                    break
                case 'min':
                    value = Math.min(...amounts)
                    break
                case 'max':
                    value = Math.max(...amounts)
                    break
                default:
                    value = amounts.reduce((a, b) => a + b, 0)
            }

            return {
                label,
                value: Math.round(value * 100) / 100,
                color: COLORS[idx % COLORS.length]
            }
        })

        return result.sort((a, b) => b.value - a.value)
    }, [transactions, config])

    const maxValue = Math.max(...chartData.map(d => d.value), 1)

    const saveChart = () => {
        const newChart = {
            id: Date.now(),
            name: `Chart ${savedCharts.length + 1}`,
            config: { ...config },
            createdAt: new Date().toISOString()
        }
        const updated = [...savedCharts, newChart]
        setSavedCharts(updated)
        localStorage.setItem('burnrate-saved-charts', JSON.stringify(updated))
    }

    const loadChart = (chart) => {
        setConfig(chart.config)
    }

    const deleteChart = (id) => {
        const updated = savedCharts.filter(c => c.id !== id)
        setSavedCharts(updated)
        localStorage.setItem('burnrate-saved-charts', JSON.stringify(updated))
    }

    return (
        <div className="chart-builder">
            <div className="builder-layout">
                {/* Config Panel */}
                <div className="config-panel">
                    <h4>Chart Configuration</h4>

                    <div className="config-group">
                        <label>Chart Type</label>
                        <div className="chart-type-selector">
                            {CHART_TYPES.map(type => (
                                <button
                                    key={type}
                                    className={`type-btn ${config.chartType === type ? 'active' : ''}`}
                                    onClick={() => setConfig({ ...config, chartType: type })}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="config-group">
                        <label>Group By (X-Axis)</label>
                        <select
                            value={config.xAxis}
                            onChange={(e) => setConfig({ ...config, xAxis: e.target.value })}
                        >
                            {X_AXIS_OPTIONS.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="config-group">
                        <label>Metric (Y-Axis)</label>
                        <select
                            value={config.yAxis}
                            onChange={(e) => setConfig({ ...config, yAxis: e.target.value })}
                        >
                            {Y_AXIS_OPTIONS.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="config-group">
                        <label>Filter</label>
                        <select
                            value={config.filter}
                            onChange={(e) => setConfig({ ...config, filter: e.target.value })}
                        >
                            <option value="all">All Transactions</option>
                            <option value="income">Income Only</option>
                            <option value="expense">Expenses Only</option>
                        </select>
                    </div>

                    <button className="save-chart-btn" onClick={saveChart}>
                        Save This Chart
                    </button>

                    {savedCharts.length > 0 && (
                        <div className="saved-charts">
                            <h5>Saved Charts</h5>
                            {savedCharts.map(chart => (
                                <div key={chart.id} className="saved-chart-item">
                                    <span onClick={() => loadChart(chart)}>{chart.name}</span>
                                    <button onClick={() => deleteChart(chart.id)}>×</button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Chart Preview */}
                <div className="chart-preview">
                    <div className="preview-header">
                        <h4>Preview</h4>
                        <span className="data-count">{chartData.length} groups</span>
                    </div>

                    {config.chartType === 'bar' && (
                        <div className="bar-chart">
                            {chartData.slice(0, 10).map((d, idx) => (
                                <div key={idx} className="bar-row">
                                    <span className="bar-label">{d.label}</span>
                                    <div className="bar-track">
                                        <div
                                            className="bar-fill"
                                            style={{
                                                width: `${(d.value / maxValue) * 100}%`,
                                                backgroundColor: d.color
                                            }}
                                        />
                                    </div>
                                    <span className="bar-value">
                                        {config.yAxis === 'count' ? d.value : formatCurrency(d.value, currency)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}

                    {config.chartType === 'pie' && (
                        <div className="pie-chart-container">
                            <div className="pie-legend">
                                {chartData.slice(0, 8).map((d, idx) => {
                                    const total = chartData.reduce((a, b) => a + b.value, 0)
                                    const pct = ((d.value / total) * 100).toFixed(1)
                                    return (
                                        <div key={idx} className="legend-item">
                                            <span className="legend-color" style={{ backgroundColor: d.color }} />
                                            <span className="legend-label">{d.label}</span>
                                            <span className="legend-pct">{pct}%</span>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}

                    {(config.chartType === 'line' || config.chartType === 'area') && (
                        <div className="line-chart">
                            <svg viewBox="0 0 400 200" preserveAspectRatio="xMidYMid meet">
                                {/* Grid lines */}
                                {[0, 25, 50, 75, 100].map(y => (
                                    <line
                                        key={y}
                                        x1="40" y1={180 - y * 1.6}
                                        x2="390" y2={180 - y * 1.6}
                                        stroke="rgba(255,255,255,0.1)"
                                    />
                                ))}

                                {/* Line/Area */}
                                {chartData.length > 1 && (
                                    <>
                                        {config.chartType === 'area' && (
                                            <path
                                                d={`M40,180 ${chartData.slice(0, 12).map((d, i) => {
                                                    const x = 40 + (i * (350 / Math.max(chartData.length - 1, 1)))
                                                    const y = 180 - ((d.value / maxValue) * 160)
                                                    return `L${x},${y}`
                                                }).join(' ')} L${40 + (Math.min(chartData.length - 1, 11) * (350 / Math.max(chartData.length - 1, 1)))},180 Z`}
                                                fill="rgba(65, 105, 225, 0.3)"
                                            />
                                        )}
                                        <polyline
                                            points={chartData.slice(0, 12).map((d, i) => {
                                                const x = 40 + (i * (350 / Math.max(chartData.length - 1, 1)))
                                                const y = 180 - ((d.value / maxValue) * 160)
                                                return `${x},${y}`
                                            }).join(' ')}
                                            fill="none"
                                            stroke="#4169E1"
                                            strokeWidth="2"
                                        />
                                        {chartData.slice(0, 12).map((d, i) => {
                                            const x = 40 + (i * (350 / Math.max(chartData.length - 1, 1)))
                                            const y = 180 - ((d.value / maxValue) * 160)
                                            return (
                                                <circle
                                                    key={i}
                                                    cx={x} cy={y} r="4"
                                                    fill="#4169E1"
                                                />
                                            )
                                        })}
                                    </>
                                )}
                            </svg>
                            <div className="line-labels">
                                {chartData.slice(0, 6).map((d, idx) => (
                                    <span key={idx}>{d.label}</span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default ChartBuilder
