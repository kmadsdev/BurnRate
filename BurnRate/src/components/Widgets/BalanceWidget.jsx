import WidgetContainer from './WidgetContainer'
import { BarChart } from '../Charts'
import { useData } from '../../context/DataContext'
import { calculateBalance, getBalanceHistory, formatCurrency } from '../../utils/calculations'

const BalanceIcon = () => (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="5" width="22" height="18" rx="2" />
        <path d="M3 11h22" />
        <path d="M18 17h3" />
    </svg>
)

function BalanceWidget() {
    const { transactions } = useData()
    const balance = calculateBalance(transactions)
    const historyData = getBalanceHistory(transactions, 7)

    return (
        <WidgetContainer
            id="balance"
            title="Balance"
            size="1x1"
            accent="primary"
            icon={<BalanceIcon />}
            periodOptions={['7 days', '30 days', '90 days']}
            defaultPeriod="7 days"
        >
            <div className="widget-value-container">
                <div className="widget-value">
                    <span className="widget-value-prefix">$</span>
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
                />
            </div>
        </WidgetContainer>
    )
}

export default BalanceWidget
