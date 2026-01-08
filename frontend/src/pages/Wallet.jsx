import { useState } from 'react'
import { useData } from '../context/DataContext'
import { TransactionTable, TransactionForm, SubscriptionsTable } from '../components/Table'
import { calculateTotalIncome, calculateTotalExpenses, formatCurrency } from '../utils/calculations'


const PlusIcon = () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M10 4v12M4 10h12" />
    </svg>
)

const Wallet = () => {
    const {
        transactions,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        getIncomeTransactions,
        getExpenseTransactions,
        currency
    } = useData()

    const [activeTab, setActiveTab] = useState('expenses')
    const [period, setPeriod] = useState('This Month')
    const [showForm, setShowForm] = useState(false)
    const [editingTransaction, setEditingTransaction] = useState(null)
    const [deleteConfirm, setDeleteConfirm] = useState(null)

    const incomeTransactions = getIncomeTransactions()
    const expenseTransactions = getExpenseTransactions()
    const totalIncome = calculateTotalIncome(transactions)
    const totalExpenses = calculateTotalExpenses(transactions)

    // Group subscriptions (recurring expenses)
    const subscriptions = Object.values(
        transactions
            .filter(t => t.type === 'expense' && t.frequency !== 'once')
            .reduce((acc, t) => {
                const key = (t.description || t.category).toLowerCase().trim()
                if (!acc[key]) {
                    acc[key] = {
                        name: t.description || t.category,
                        category: t.category,
                        frequency: t.frequency,
                        amount: t.amount,
                        customDays: t.customDays,
                        totalSpent: 0
                    }
                }
                // Update with latest details if newer (assuming transactions are sorted or we just take the last encountered if random, 
                // but ideally we'd want the "current" subscription details so we'll just stick with what we have or update fields)
                // For simplified logic, we assume consistent description means consistent subscription.

                acc[key].totalSpent += t.amount
                return acc
            }, {})
    ).sort((a, b) => b.totalSpent - a.totalSpent)

    const handleAddClick = () => {
        setEditingTransaction(null)
        setShowForm(true)
    }

    const handleEditClick = (transaction) => {
        setEditingTransaction(transaction)
        setShowForm(true)
    }

    const handleDeleteClick = (id) => {
        setDeleteConfirm(id)
    }

    const handleConfirmDelete = () => {
        if (deleteConfirm) {
            deleteTransaction(deleteConfirm)
            setDeleteConfirm(null)
        }
    }

    const handleFormSubmit = (data) => {
        if (editingTransaction) {
            updateTransaction(editingTransaction.id, data)
        } else {
            addTransaction(data)
        }
        setShowForm(false)
        setEditingTransaction(null)
    }

    const handleFormCancel = () => {
        setShowForm(false)
        setEditingTransaction(null)
    }

    return (
        <div className="page wallet-page">
            <header className="page-header">
                <div className="page-header-left">
                    <h1 className="page-title">Transactions</h1>
                    <p className="page-subtitle">Manage your income and expenses</p>
                </div>
                <button className="btn btn-primary" onClick={handleAddClick}>
                    <PlusIcon />
                    <span>Add Transaction</span>
                </button>
            </header>

            {/* Summary Cards */}
            <div className="summary-cards">
                <div className="summary-card income">
                    <span className="summary-label">Total Income</span>
                    <span className="summary-value">{formatCurrency(totalIncome, currency)}</span>
                </div>
                <div className="summary-card expense">
                    <span className="summary-label">Total Expenses</span>
                    <span className="summary-value">{formatCurrency(totalExpenses, currency)}</span>
                </div>
                <div className="summary-card balance">
                    <span className="summary-label">Balance</span>
                    <span className="summary-value">{formatCurrency(totalIncome - totalExpenses, currency)}</span>
                </div>
            </div>

            {/* Tabs */}
            <div className="tabs-container">
                <div className="tabs">
                    <button
                        className={`tab ${activeTab === 'expenses' ? 'active' : ''}`}
                        onClick={() => setActiveTab('expenses')}
                    >
                        Expenses ({expenseTransactions.length})
                    </button>
                    <button
                        className={`tab ${activeTab === 'income' ? 'active' : ''}`}
                        onClick={() => setActiveTab('income')}
                    >
                        Income ({incomeTransactions.length})
                    </button>
                    <button
                        className={`tab ${activeTab === 'subscriptions' ? 'active' : ''}`}
                        onClick={() => setActiveTab('subscriptions')}
                    >
                        Subscriptions ({subscriptions.length})
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="table-wrapper">
                {activeTab === 'subscriptions' ? (
                    <SubscriptionsTable subscriptions={subscriptions} />
                ) : (
                    <TransactionTable
                        transactions={activeTab === 'expenses' ? expenseTransactions : incomeTransactions}
                        onEdit={handleEditClick}
                        onDelete={handleDeleteClick}
                        emptyMessage={activeTab === 'expenses'
                            ? 'No expenses yet. Click "Add Transaction" to add one.'
                            : 'No income entries yet. Click "Add Transaction" to add one.'}
                    />
                )}
            </div>

            {/* Add/Edit Form Modal */}
            {showForm && (
                <TransactionForm
                    transaction={editingTransaction}
                    type={activeTab === 'expenses' ? 'expense' : 'income'}
                    onSubmit={handleFormSubmit}
                    onCancel={handleFormCancel}
                />
            )}

            {/* Delete Confirmation Modal */}
            {deleteConfirm && (
                <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
                    <div className="modal-content modal-confirm" onClick={(e) => e.stopPropagation()}>
                        <h3>Delete Transaction?</h3>
                        <p>This action cannot be undone.</p>
                        <div className="form-actions">
                            <button className="btn btn-secondary" onClick={() => setDeleteConfirm(null)}>
                                Cancel
                            </button>
                            <button className="btn btn-danger" onClick={handleConfirmDelete}>
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Wallet
