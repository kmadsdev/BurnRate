import { formatCurrency } from '../../utils/calculations'
import { useData } from '../../context/DataContext'

const EditIcon = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11.5 2.5l2 2-8 8H3.5v-2l8-8z" />
    </svg>
)

const DeleteIcon = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 4h12" />
        <path d="M5 4V2.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 .5.5V4" />
        <path d="M12.5 4v9.5a1 1 0 0 1-1 1h-7a1 1 0 0 1-1-1V4" />
        <path d="M6.5 7v5" />
        <path d="M9.5 7v5" />
    </svg>
)

const frequencyLabels = {
    once: 'One-time',
    weekly: 'Weekly',
    monthly: 'Monthly',
    yearly: 'Yearly',
    custom: 'Custom'
}

function TransactionTable({
    transactions,
    onEdit,
    onDelete,
    emptyMessage = 'No transactions yet'
}) {
    const { currency } = useData()

    if (transactions.length === 0) {
        return (
            <div className="table-empty">
                <p>{emptyMessage}</p>
            </div>
        )
    }

    const formatDate = (dateStr) => {
        const date = new Date(dateStr)
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        })
    }

    const getFrequencyLabel = (transaction) => {
        if (transaction.frequency === 'custom' && transaction.customDays) {
            return `Every ${transaction.customDays} days`
        }
        return frequencyLabels[transaction.frequency] || transaction.frequency
    }

    // Sort by date descending
    const sortedTransactions = [...transactions].sort((a, b) =>
        new Date(b.date) - new Date(a.date)
    )

    return (
        <div className="table-container">
            <table className="data-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Company</th>
                        <th>Category</th>
                        <th>Frequency</th>
                        <th>Date</th>
                        <th className="text-right">Amount</th>
                        <th className="text-center">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {sortedTransactions.map((transaction) => (
                        <tr key={transaction.id}>
                            <td className="table-name">
                                <span className="transaction-name">{transaction.name || transaction.description || '—'}</span>
                            </td>
                            <td className="table-company">
                                {transaction.company || '—'}
                            </td>
                            <td>
                                <span className="category-badge">{transaction.category}</span>
                            </td>
                            <td className="table-frequency">
                                {getFrequencyLabel(transaction)}
                            </td>
                            <td className="table-date">{formatDate(transaction.date)}</td>
                            <td className={`table-amount text-right ${transaction.type}`}>
                                {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount, currency)}
                            </td>
                            <td className="table-actions text-center">
                                <button
                                    className="action-btn edit"
                                    onClick={() => onEdit(transaction)}
                                    title="Edit"
                                >
                                    <EditIcon />
                                </button>
                                <button
                                    className="action-btn delete"
                                    onClick={() => onDelete(transaction.id)}
                                    title="Delete"
                                >
                                    <DeleteIcon />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <style>{`
                .table-name .transaction-name {
                    font-weight: 500;
                    color: var(--text-primary);
                }
                .table-company {
                    color: var(--text-secondary);
                    font-size: 13px;
                }
            `}</style>
        </div>
    )
}

export default TransactionTable
