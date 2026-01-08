import { useState } from 'react'
import { useData } from '../../context/DataContext'

function TransactionForm({
    transaction = null,
    type = 'expense',
    onSubmit,
    onCancel
}) {
    const { getCategoryNames } = useData()

    // Get today's date in YYYY-MM-DD format using local time (not UTC)
    const getLocalDateString = () => {
        const now = new Date()
        const year = now.getFullYear()
        const month = String(now.getMonth() + 1).padStart(2, '0')
        const day = String(now.getDate()).padStart(2, '0')
        return `${year}-${month}-${day}`
    }

    const [formData, setFormData] = useState({
        type: transaction?.type || type,
        name: transaction?.name || '',
        company: transaction?.company || '',
        amount: transaction?.amount || '',
        category: transaction?.category || '',
        frequency: transaction?.frequency || 'once',
        customDays: transaction?.customDays || '',
        date: transaction?.date || getLocalDateString(),
        description: transaction?.description || ''
    })

    const categories = getCategoryNames(formData.type)

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: name === 'amount' || name === 'customDays'
                ? (value === '' ? '' : parseFloat(value) || 0)
                : value
        }))
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        if (!formData.amount || !formData.category) {
            return
        }
        onSubmit({
            ...formData,
            amount: parseFloat(formData.amount),
            customDays: formData.frequency === 'custom' ? parseInt(formData.customDays) : null
        })
    }

    return (
        <div className="modal-overlay" onClick={onCancel}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{transaction ? 'Edit Transaction' : 'Add Transaction'}</h2>
                    <button className="modal-close" onClick={onCancel}>×</button>
                </div>

                <form onSubmit={handleSubmit} className="transaction-form">
                    <div className="form-group">
                        <label htmlFor="type">Type</label>
                        <select
                            id="type"
                            name="type"
                            value={formData.type}
                            onChange={handleChange}
                        >
                            <option value="income">Income</option>
                            <option value="expense">Expense</option>
                        </select>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="name">Transaction Name</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="e.g., Monthly Salary"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="company">Company / Vendor</label>
                            <input
                                type="text"
                                id="company"
                                name="company"
                                value={formData.company}
                                onChange={handleChange}
                                placeholder="e.g., TechCorp Inc."
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="amount">Amount ($)</label>
                        <input
                            type="number"
                            id="amount"
                            name="amount"
                            value={formData.amount}
                            onChange={handleChange}
                            placeholder="0.00"
                            step="0.01"
                            min="0"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="category">Category</label>
                        <select
                            id="category"
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Select category...</option>
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="frequency">Frequency</label>
                        <select
                            id="frequency"
                            name="frequency"
                            value={formData.frequency}
                            onChange={handleChange}
                        >
                            <option value="once">One-time</option>
                            <option value="weekly">Weekly</option>
                            <option value="monthly">Monthly</option>
                            <option value="yearly">Yearly</option>
                            <option value="custom">Every X days</option>
                        </select>
                    </div>

                    {formData.frequency === 'custom' && (
                        <div className="form-group">
                            <label htmlFor="customDays">Every how many days?</label>
                            <input
                                type="number"
                                id="customDays"
                                name="customDays"
                                value={formData.customDays}
                                onChange={handleChange}
                                placeholder="14"
                                min="1"
                                required
                            />
                        </div>
                    )}

                    <div className="form-group">
                        <label htmlFor="date">Start Date</label>
                        <input
                            type="date"
                            id="date"
                            name="date"
                            value={formData.date}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="description">Description (Optional)</label>
                        <input
                            type="text"
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Additional notes..."
                        />
                    </div>

                    <div className="form-actions">
                        <button type="button" className="btn btn-secondary" onClick={onCancel}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary">
                            {transaction ? 'Save Changes' : 'Add Transaction'}
                        </button>
                    </div>
                </form>
            </div>

            <style>{`
                .form-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 16px;
                }
                @media (max-width: 500px) {
                    .form-row {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </div>
    )
}

export default TransactionForm
