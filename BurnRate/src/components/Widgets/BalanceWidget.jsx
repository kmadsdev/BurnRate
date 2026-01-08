import { useState, useMemo } from 'react'
import WidgetContainer from './WidgetContainer'
import { BarChart } from '../Charts'
import { useData } from '../../context/DataContext'
import { calculateBalance, getBalanceHistory } from '../../utils/calculations'

const BalanceIcon = () => (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="5" width="22" height="18" rx="2" />
        <path d="M3 11h22" />
        <path d="M18 17h3" />
    </svg>
)

const periodToDays = {
    '7 days': 7,
    '30 days': 30,
    '90 days': 90,
}

function BalanceWidget({ size = '1x1' }) {
    const { transactions, currency } = useData()
    const [period, setPeriod] = useState('7 days')

    const days = periodToDays[period] || 7

    const { balance, historyData } = useMemo(() => {
        return {
            balance: calculateBalance(transactions),
            historyData: getBalanceHistory(transactions, days)
        }
    }, [transactions, days])

    return (
        <WidgetContainer
            id="balance"
            title="Balance"
            size={size}
            accent="primary"
            icon={<BalanceIcon />}
            periodOptions={['7 days', '30 days', '90 days']}
            defaultPeriod={period}
            onPeriodChange={setPeriod}
        >
            <div className="widget-value-container">
                <div className="widget-value">
                    <span className="widget-value-prefix">{currency}</span>
                    {new Intl.NumberFormat('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                    }).format(balance)}
                </div>
            </div>

            <div className="widget-chart">
                <BarChart
                    data={historyData}
                    height={106}
                    barColor="rgba(255, 255, 255, 0.64)"
                    currency={currency}
                />
            </div>
        </WidgetContainer>
    )
}

export default BalanceWidget
