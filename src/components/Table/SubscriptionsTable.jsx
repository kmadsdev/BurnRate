import { formatCurrency } from '../../utils/calculations'
import { useData } from '../../context/DataContext'

const getFrequencyLabel = (sub) => {
    switch (sub.frequency) {
        case 'weekly': return 'Weekly'
        case 'monthly': return 'Monthly'
        case 'yearly': return 'Yearly'
        case 'custom': return `Every ${sub.customDays} days`
        default: return sub.frequency
    }
}

function SubscriptionsTable({ subscriptions }) {
    const { currency } = useData()

    if (subscriptions.length === 0) {
        return (
            <div className="table-empty">
                <div className="table-empty-icon">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                </div>
                <h3>No subscriptions found</h3>
                <p>Recurring expenses will appear here.</p>
            </div>
        )
    }

    return (
        <div className="table-container">
            <table className="data-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Category</th>
                        <th>Frequency</th>
                        <th className="text-right">Cost</th>
                        <th className="text-right">Total Spent</th>
                    </tr>
                </thead>
                <tbody>
                    {subscriptions.map((sub, index) => (
                        <tr key={index}>
                            <td className="table-description">
                                {sub.name}
                            </td>
                            <td>
                                <span className="category-badge">
                                    {sub.category}
                                </span>
                            </td>
                            <td className="table-frequency">
                                {getFrequencyLabel(sub)}
                            </td>
                            <td className="table-amount text-right expense">
                                -{formatCurrency(sub.amount, currency)}
                            </td>
                            <td className="table-amount text-right" style={{ fontWeight: 600 }}>
                                {formatCurrency(sub.totalSpent, currency)}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

export default SubscriptionsTable
