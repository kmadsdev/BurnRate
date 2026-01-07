import { useState } from 'react'
import { incomeCategories, expenseCategories } from '../../utils/calculations'

function TransactionForm({
    transaction = null,
    type = 'expense',
    onSubmit,
    onCancel
}) {
    const [formData, setFormData] = useState({
        type: transaction?.type || type,
        amount: transaction?.amount || '',
        category: transaction?.category || '',
        frequency: transaction?.frequency || 'once',
        customDays: transaction?.customDays || '',
        date: transaction?.date || new Date().toISOString().split('T')[0],
        description: transaction?.description || ''
    })

    const categories = formData.type === 'income' ? incomeCategories : expenseCategories

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
                        <label htmlFor="date">Date</label>
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
                        <label htmlFor="description">Description</label>
                        <input
                            type="text"
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Optional description..."
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
        </div>
    )
}

export default TransactionForm
