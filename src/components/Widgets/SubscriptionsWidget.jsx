import WidgetContainer from './WidgetContainer'
import { useData } from '../../context/DataContext'
import { formatCurrency } from '../../utils/calculations'

const SubscriptionIcon = () => (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="22" height="20" rx="2" />
        <path d="M3 10h22" />
        <path d="M9 16h2" />
        <path d="M17 16h2" />
        <path d="M9 20h10" />
    </svg>
)

const frequencyToMonthly = (amount, frequency, customDays) => {
    switch (frequency) {
        case 'weekly':
            return amount * 4.33 // avg weeks per month
        case 'monthly':
            return amount
        case 'yearly':
            return amount / 12
        case 'custom':
            return customDays ? (amount * 30) / customDays : amount
        default:
            return 0 // one-time doesn't count as subscription
    }
}

function SubscriptionsWidget({ size = '1x1' }) {
    const { transactions, currency } = useData()

    // Get recurring expenses (subscriptions)
    const subscriptions = transactions.filter(t =>
        t.type === 'expense' &&
        t.frequency !== 'once' &&
        ['Subscriptions', 'Cloud Services', 'Tools'].includes(t.category)
    )

    // Calculate monthly total
    const monthlyTotal = subscriptions.reduce((sum, sub) => {
        return sum + frequencyToMonthly(sub.amount, sub.frequency, sub.customDays)
    }, 0)

    // Calculate yearly total
    const yearlyTotal = monthlyTotal * 12

    // Sort by amount (highest first)
    const sortedSubs = [...subscriptions].sort((a, b) =>
        frequencyToMonthly(b.amount, b.frequency, b.customDays) -
        frequencyToMonthly(a.amount, a.frequency, a.customDays)
    ).slice(0, size === '2x1' ? 6 : 3) // Show more in wider widget

    const getFrequencyLabel = (freq) => {
        switch (freq) {
            case 'weekly': return '/week'
            case 'monthly': return '/mo'
            case 'yearly': return '/year'
            case 'custom': return ''
            default: return ''
        }
    }

    return (
        <WidgetContainer
            id="subscriptions"
            title="Subscriptions"
            size={size}
            icon={<SubscriptionIcon />}
            showPeriodSelector={false}
        >
            <div className="subscriptions-widget">
                <div className="subscriptions-summary">
                    <div className="subscriptions-summary-item">
                        <span className="subscriptions-label">Monthly</span>
                        <span className="subscriptions-value">{formatCurrency(monthlyTotal, currency)}</span>
                    </div>
                    <div className="subscriptions-summary-item">
                        <span className="subscriptions-label">Yearly</span>
                        <span className="subscriptions-value">{formatCurrency(yearlyTotal, currency)}</span>
                    </div>
                </div>

                <div className="subscriptions-list">
                    {sortedSubs.length > 0 ? (
                        sortedSubs.map(sub => (
                            <div key={sub.id} className="subscription-details">
                                <div className="subscription-header">
                                    <span className="subscription-title">{sub.description || sub.category}</span>
                                    <span className="subscription-amount">{formatCurrency(sub.amount, currency)}</span>
                                </div>
                                <span className="subscription-category">{sub.category}</span>
                                <span className="subscription-frequency">
                                    <small>{getFrequencyLabel(sub.frequency)}</small>
                                </span>
                            </div>
                        ))
                    ) : (
                        <div className="subscriptions-empty">
                            No recurring subscriptions
                        </div>
                    )}
                </div>
            </div>
        </WidgetContainer>
    )
}

export default SubscriptionsWidget
