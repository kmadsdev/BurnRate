import { useState, useEffect } from 'react'
import { useData } from '../context/DataContext'
import { formatCurrency } from '../utils/calculations'

const PlusIcon = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M8 3v10M3 8h10" />
    </svg>
)

const TrashIcon = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2.5 4h11" />
        <path d="M5.5 4V2.5h5V4" />
        <path d="M6 7v6" />
        <path d="M10 7v6" />
        <path d="M3.5 4l1 10h7l1-10" />
    </svg>
)

const EditIcon = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 2l5 5L7 14H2v-5l7-7z" />
    </svg>
)

const CheckIcon = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13.5 4.5L6 12l-3.5-3.5" />
    </svg>
)

const COLORS = [
    { value: '#3B82F6', label: 'Blue' },
    { value: '#8B5CF6', label: 'Purple' },
    { value: '#EC4899', label: 'Pink' },
    { value: '#EF4444', label: 'Red' },
    { value: '#F97316', label: 'Orange' },
    { value: '#EAB308', label: 'Yellow' },
    { value: '#22C55E', label: 'Green' },
    { value: '#14B8A6', label: 'Teal' },
]

function GoalModal({ isOpen, onClose, onSave, initialData }) {
    const [formData, setFormData] = useState(
        initialData || {
            title: '',
            targetAmount: '',
            currentAmount: '0',
            deadline: '',

            category: 'Savings',
            color: '#3B82F6',
        }
    )

    useEffect(() => {
        if (isOpen) {
            setFormData(initialData || {
                title: '',
                targetAmount: '',
                currentAmount: '0',
                deadline: '',
                category: 'Savings',
                color: '#3B82F6',
            })
        }
    }, [isOpen, initialData])

    if (!isOpen) return null

    const handleSubmit = (e) => {
        e.preventDefault()
        onSave(formData)
        onClose()
    }

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h2>{initialData ? 'Edit Goal' : 'New Goal'}</h2>
                    <button onClick={onClose} className="modal-close">&times;</button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Title</label>
                        <input
                            type="text"
                            required
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                            placeholder="e.g. New Laptop"
                        />
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Target Amount</label>
                            <input
                                type="number"
                                required
                                min="1"
                                value={formData.targetAmount}
                                onChange={e => setFormData({ ...formData, targetAmount: e.target.value })}
                                placeholder="1000"
                            />
                        </div>
                        <div className="form-group">
                            <label>Current Amount</label>
                            <input
                                type="number"
                                required
                                min="0"
                                value={formData.currentAmount}
                                onChange={e => setFormData({ ...formData, currentAmount: e.target.value })}
                                placeholder="0"
                            />
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Category</label>
                        <select
                            value={formData.category}
                            onChange={e => setFormData({ ...formData, category: e.target.value })}
                        >
                            <option value="Savings">Savings</option>
                            <option value="Purchase">Purchase</option>
                            <option value="Investment">Investment</option>
                            <option value="Debt">Debt Payoff</option>
                            <option value="Travel">Travel</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Color</label>
                        <div className="color-options">
                            {COLORS.map(c => (
                                <button
                                    key={c.value}
                                    type="button"
                                    className={`color-option ${formData.color === c.value ? 'selected' : ''}`}
                                    style={{ backgroundColor: c.value }}
                                    onClick={() => setFormData({ ...formData, color: c.value })}
                                    title={c.label}
                                />
                            ))}
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Deadline (Optional)</label>
                        <input
                            type="date"
                            value={formData.deadline}
                            onChange={e => setFormData({ ...formData, deadline: e.target.value })}
                        />
                    </div>
                    <div className="modal-actions">
                        <button type="button" onClick={onClose} className="btn btn-secondary">Cancel</button>
                        <button type="submit" className="btn btn-primary">Save Goal</button>
                    </div>
                </form>
            </div>
        </div>
    )
}

function Goals() {
    const {
        goals,
        addGoal,
        updateGoal,
        deleteGoal,
        toggleGoalCompletion,
        currency
    } = useData()
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingGoal, setEditingGoal] = useState(null)

    const handleSave = (data) => {
        if (editingGoal) {
            updateGoal(editingGoal.id, data)
        } else {
            addGoal(data)
        }
    }

    const openForEdit = (goal) => {
        setEditingGoal(goal)
        setIsModalOpen(true)
    }

    const openForNew = () => {
        setEditingGoal(null)
        setIsModalOpen(true)
    }

    return (
        <div className="page">
            <header className="dashboard-header">
                <div>
                    <h1 className="dashboard-title">Goals</h1>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
                        Track your savings and financial targets
                    </p>
                </div>
                <button onClick={openForNew} className="btn btn-primary">
                    <PlusIcon />
                    <span>New Goal</span>
                </button>
            </header>

            <div className="page-content">
                <div className="goals-grid">
                    {goals.map(goal => {
                        const progress = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100))

                        return (
                            <div key={goal.id} className={`transaction-form ${goal.completed ? 'opacity-75' : ''}`} style={{ marginBottom: 0, height: '100%', display: 'flex', flexDirection: 'column' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                    <div>
                                        <div style={{
                                            fontSize: '11px',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.05em',
                                            color: 'var(--text-muted)',
                                            marginBottom: '4px',
                                            fontWeight: 600
                                        }}>
                                            {goal.category}
                                        </div>
                                        <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)' }}>
                                            {goal.title}
                                        </h3>
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button
                                            onClick={() => {
                                                if (window.confirm(goal.completed ? 'Are you sure you want to reactivate this goal?' : 'Are you sure you want to mark this goal as completed?')) {
                                                    toggleGoalCompletion(goal.id)
                                                }
                                            }}
                                            className="btn-icon"
                                            title={goal.completed ? "Mark as active" : "Mark as completed"}
                                            style={{ color: goal.completed ? 'var(--accent-primary)' : 'var(--text-muted)' }}
                                        >
                                            <CheckIcon />
                                        </button>
                                        <button
                                            onClick={() => openForEdit(goal)}
                                            className="btn-icon"
                                            title="Edit"
                                        >
                                            <EditIcon />
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (window.confirm('Are you sure you want to delete this goal?')) {
                                                    deleteGoal(goal.id)
                                                }
                                            }}
                                            className="btn-icon"
                                            title="Delete"
                                            style={{ color: '#FF4F79' }}
                                        >
                                            <TrashIcon />
                                        </button>
                                    </div>
                                </div>

                                <div style={{ marginBottom: '16px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
                                        <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{formatCurrency(goal.currentAmount, currency)}</span>
                                        <span style={{ color: 'var(--text-muted)' }}>of {formatCurrency(goal.targetAmount, currency)}</span>
                                    </div>
                                    <div style={{
                                        height: '8px',
                                        backgroundColor: 'var(--bg-primary)',
                                        borderRadius: '4px',
                                        overflow: 'hidden'
                                    }}>
                                        <div style={{
                                            width: `${progress}%`,
                                            height: '100%',
                                            backgroundColor: goal.completed ? 'var(--text-muted)' : (goal.color || 'var(--accent-primary)'),
                                            borderRadius: '4px',
                                            transition: 'width 0.5s ease'
                                        }} />
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', fontSize: '11px', color: 'var(--text-muted)' }}>
                                        <span>{progress}%</span>
                                        {goal.deadline && <span>by {new Date(goal.deadline).toLocaleDateString()}</span>}
                                    </div>
                                </div>
                            </div>
                        )
                    })}

                    {goals.length === 0 && (
                        <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                            No goals found. Create one to get started!
                        </div>
                    )}
                </div>
            </div>

            <GoalModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                initialData={editingGoal}
            />

            <style>{`
                .goals-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                    gap: 20px;
                }
                .btn-icon {
                    background: none;
                    border: none;
                    color: var(--text-muted);
                    cursor: pointer;
                    padding: 4px;
                    border-radius: 4px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s;
                }
                .btn-icon:hover {
                    color: var(--text-primary);
                    background-color: var(--bg-hover);
                }
                .form-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 16px;
                }
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-color: rgba(0, 0, 0, 0.7);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 10000;
                    backdrop-filter: blur(4px);
                }
                .modal-content {
                    background-color: var(--bg-card);
                    border-radius: 12px;
                    padding: 24px;
                    width: 100%;
                    max-width: 500px;
                    box-shadow: var(--shadow-xl);
                }
                .modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 24px;
                }
                .modal-header h2 {
                    font-size: 20px;
                    font-weight: 600;
                    margin: 0;
                }
                .modal-close {
                    background: none;
                    border: none;
                    font-size: 24px;
                    color: var(--text-muted);
                    cursor: pointer;
                    line-height: 1;
                }
                .modal-actions {
                    display: flex;
                    justify-content: flex-end;
                    gap: 12px;
                    margin-top: 24px;
                }
                .modal-actions {
                    display: flex;
                    justify-content: flex-end;
                    gap: 12px;
                    margin-top: 24px;
                }
                .color-options {
                    display: flex;
                    gap: 12px;
                    flex-wrap: wrap;
                    margin-top: 8px;
                }
                .color-option {
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    border: 2px solid transparent;
                    cursor: pointer;
                    transition: all 0.2s;
                    padding: 0;
                }
                .color-option:hover {
                    transform: scale(1.1);
                }
                .color-option.selected {
                    border-color: var(--text-primary);
                    transform: scale(1.1);
                }
            `}</style>
        </div>
    )
}

export default Goals
