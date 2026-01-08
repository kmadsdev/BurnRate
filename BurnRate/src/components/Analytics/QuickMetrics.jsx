import { useState, useMemo } from 'react'
import { useData } from '../../context/DataContext'
import { formatCurrency } from '../../utils/calculations'

function QuickMetrics() {
    const { transactions, goals, currency } = useData()

    const metrics = useMemo(() => {
        const now = new Date()
        const thisMonth = now.getMonth()
        const thisYear = now.getFullYear()

        // This month's transactions
        const monthTransactions = transactions.filter(t => {
            const [year, month] = t.date.split('-').map(Number)
            return year === thisYear && month === thisMonth + 1
        })

        // Calculate metrics
        const totalIncome = transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0)

        const totalExpenses = transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0)

        const monthlyIncome = monthTransactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0)

        const monthlyExpenses = monthTransactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0)

        const recurringExpenses = transactions
            .filter(t => t.type === 'expense' && t.frequency !== 'once')
            .reduce((sum, t) => sum + t.amount, 0)

        const oneTimeExpenses = transactions
            .filter(t => t.type === 'expense' && t.frequency === 'once')
            .reduce((sum, t) => sum + t.amount, 0)

        // Category breakdown
        const categoryTotals = {}
        transactions.filter(t => t.type === 'expense').forEach(t => {
            categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount
        })
        const topCategory = Object.entries(categoryTotals)
            .sort((a, b) => b[1] - a[1])[0] || ['None', 0]

        // Goals progress
        const totalGoalTarget = goals.reduce((sum, g) => sum + (g.targetAmount || 0), 0)
        const totalGoalProgress = goals.reduce((sum, g) => sum + (g.currentAmount || 0), 0)
        const goalsProgress = totalGoalTarget > 0
            ? Math.round((totalGoalProgress / totalGoalTarget) * 100)
            : 0

        // Savings rate
        const savingsRate = totalIncome > 0
            ? Math.round(((totalIncome - totalExpenses) / totalIncome) * 100)
            : 0

        return {
            totalIncome,
            totalExpenses,
            balance: totalIncome - totalExpenses,
            monthlyIncome,
            monthlyExpenses,
            monthlyBurnRate: monthlyExpenses,
            savingsRate,
            recurringExpenses,
            oneTimeExpenses,
            recurringRatio: totalExpenses > 0
                ? Math.round((recurringExpenses / totalExpenses) * 100)
                : 0,
            transactionCount: transactions.length,
            avgTransactionAmount: transactions.length > 0
                ? Math.round(transactions.reduce((sum, t) => sum + t.amount, 0) / transactions.length)
                : 0,
            topCategory: topCategory[0],
            topCategoryAmount: topCategory[1],
            goalsProgress,
            activeGoals: goals.filter(g => !g.completed).length
        }
    }, [transactions, goals])

    const MetricCard = ({ label, value, subvalue, color, icon }) => (
        <div className="metric-card">
            <div className="metric-icon" style={{ color }}>{icon}</div>
            <div className="metric-content">
                <span className="metric-value" style={{ color }}>{value}</span>
                <span className="metric-label">{label}</span>
                {subvalue && <span className="metric-subvalue">{subvalue}</span>}
            </div>
        </div>
    )

    return (
        <div className="quick-metrics">
            <div className="metrics-grid">
                <MetricCard
                    label="Total Balance"
                    value={formatCurrency(metrics.balance, currency)}
                    color={metrics.balance >= 0 ? '#61E813' : '#FF4F79'}
                    icon="💰"
                />
                <MetricCard
                    label="Monthly Burn Rate"
                    value={formatCurrency(metrics.monthlyBurnRate, currency)}
                    subvalue="This month's expenses"
                    color="#FF4F79"
                    icon="🔥"
                />
                <MetricCard
                    label="Savings Rate"
                    value={`${metrics.savingsRate}%`}
                    subvalue="Of income saved"
                    color={metrics.savingsRate >= 20 ? '#61E813' : '#FFBE0A'}
                    icon="📈"
                />
                <MetricCard
                    label="Recurring Expenses"
                    value={formatCurrency(metrics.recurringExpenses, currency)}
                    subvalue={`${metrics.recurringRatio}% of total`}
                    color="#9B59B6"
                    icon="🔄"
                />
                <MetricCard
                    label="Top Spending"
                    value={metrics.topCategory}
                    subvalue={formatCurrency(metrics.topCategoryAmount, currency)}
                    color="#4169E1"
                    icon="📊"
                />
                <MetricCard
                    label="Goals Progress"
                    value={`${metrics.goalsProgress}%`}
                    subvalue={`${metrics.activeGoals} active goals`}
                    color="#3498DB"
                    icon="🎯"
                />
                <MetricCard
                    label="Transaction Count"
                    value={metrics.transactionCount}
                    subvalue={`Avg: ${formatCurrency(metrics.avgTransactionAmount, currency)}`}
                    color="#A7A8AB"
                    icon="📝"
                />
                <MetricCard
                    label="Monthly Income"
                    value={formatCurrency(metrics.monthlyIncome, currency)}
                    subvalue="This month"
                    color="#61E813"
                    icon="💵"
                />
            </div>

            {/* Quick Stats Table */}
            <div className="stats-table">
                <h4>Detailed Breakdown</h4>
                <table>
                    <tbody>
                        <tr>
                            <td>Total Income (All Time)</td>
                            <td className="income">{formatCurrency(metrics.totalIncome, currency)}</td>
                        </tr>
                        <tr>
                            <td>Total Expenses (All Time)</td>
                            <td className="expense">{formatCurrency(metrics.totalExpenses, currency)}</td>
                        </tr>
                        <tr>
                            <td>One-Time Expenses</td>
                            <td>{formatCurrency(metrics.oneTimeExpenses, currency)}</td>
                        </tr>
                        <tr>
                            <td>Recurring Expenses</td>
                            <td>{formatCurrency(metrics.recurringExpenses, currency)}</td>
                        </tr>
                        <tr>
                            <td>This Month Income</td>
                            <td className="income">{formatCurrency(metrics.monthlyIncome, currency)}</td>
                        </tr>
                        <tr>
                            <td>This Month Expenses</td>
                            <td className="expense">{formatCurrency(metrics.monthlyExpenses, currency)}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default QuickMetrics
