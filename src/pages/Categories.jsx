import { useState } from 'react'
import { useData } from '../context/DataContext'

const PlusIcon = () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M10 4v12M4 10h12" />
    </svg>
)

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
    </svg>
)

// Predefined color palette
const COLOR_PALETTE = [
    '#4169E1', '#61E813', '#FF4F79', '#FFBE0A', '#9B59B6',
    '#3498DB', '#1ABC9C', '#E67E22', '#E74C3C', '#34495E',
    '#16A085', '#27AE60', '#2980B9', '#8E44AD', '#F39C12'
]

function Categories() {
    const { categories, addCategory, updateCategory, deleteCategory, transactions } = useData()

    const [showForm, setShowForm] = useState(false)
    const [editingCategory, setEditingCategory] = useState(null)
    const [formData, setFormData] = useState({ name: '', color: COLOR_PALETTE[0], type: 'expense' })
    const [deleteConfirm, setDeleteConfirm] = useState(null)

    const handleAdd = (type) => {
        setEditingCategory(null)
        setFormData({ name: '', color: COLOR_PALETTE[Math.floor(Math.random() * COLOR_PALETTE.length)], type })
        setShowForm(true)
    }

    const handleEdit = (category, type) => {
        setEditingCategory({ ...category, type })
        setFormData({ name: category.name, color: category.color || COLOR_PALETTE[0], type })
        setShowForm(true)
    }

    const handleDelete = (categoryName, type) => {
        // Check if category is in use
        const inUseCount = transactions.filter(t => t.category === categoryName && t.type === type).length
        setDeleteConfirm({ name: categoryName, type, inUseCount })
    }

    const confirmDelete = () => {
        if (deleteConfirm) {
            deleteCategory(deleteConfirm.type, deleteConfirm.name)
            setDeleteConfirm(null)
        }
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        if (!formData.name.trim()) return

        if (editingCategory) {
            updateCategory(formData.type, editingCategory.name, {
                name: formData.name.trim(),
                color: formData.color
            })
        } else {
            addCategory(formData.type, {
                name: formData.name.trim(),
                color: formData.color
            })
        }
        setShowForm(false)
        setEditingCategory(null)
    }

    const renderCategoryList = (type) => {
        const categoryList = categories[type] || []

        return (
            <div className="category-list">
                {categoryList.map((cat) => {
                    const category = typeof cat === 'string' ? { name: cat, color: null } : cat
                    const usageCount = transactions.filter(t => t.category === category.name && t.type === type).length

                    return (
                        <div key={category.name} className="category-item">
                            <div className="category-info">
                                <span
                                    className="category-color"
                                    style={{ backgroundColor: category.color || (type === 'income' ? 'var(--accent-green)' : 'var(--accent-red)') }}
                                />
                                <span className="category-name">{category.name}</span>
                                {usageCount > 0 && (
                                    <span className="category-usage">{usageCount} transaction{usageCount !== 1 ? 's' : ''}</span>
                                )}
                            </div>
                            <div className="category-actions">
                                <button
                                    className="action-btn edit"
                                    onClick={() => handleEdit(category, type)}
                                    title="Edit"
                                >
                                    <EditIcon />
                                </button>
                                <button
                                    className="action-btn delete"
                                    onClick={() => handleDelete(category.name, type)}
                                    title="Delete"
                                >
                                    <DeleteIcon />
                                </button>
                            </div>
                        </div>
                    )
                })}

                <button className="add-category-btn" onClick={() => handleAdd(type)}>
                    <PlusIcon />
                    <span>Add Category</span>
                </button>
            </div>
        )
    }

    return (
        <div className="page">
            <header className="dashboard-header">
                <h1 className="dashboard-title">Categories</h1>
            </header>

            <div className="page-content" style={{ maxWidth: '900px' }}>
                <div className="categories-grid">
                    {/* Income Categories */}
                    <div className="categories-section income">
                        <div className="section-header">
                            <h2>Income Categories</h2>
                            <span className="category-count">{categories.income?.length || 0} categories</span>
                        </div>
                        {renderCategoryList('income')}
                    </div>

                    {/* Expense Categories */}
                    <div className="categories-section expense">
                        <div className="section-header">
                            <h2>Expense Categories</h2>
                            <span className="category-count">{categories.expense?.length || 0} categories</span>
                        </div>
                        {renderCategoryList('expense')}
                    </div>
                </div>
            </div>

            {/* Add/Edit Form Modal */}
            {showForm && (
                <div className="modal-overlay" onClick={() => setShowForm(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{editingCategory ? 'Edit Category' : 'Add Category'}</h2>
                            <button className="modal-close" onClick={() => setShowForm(false)}>×</button>
                        </div>

                        <form onSubmit={handleSubmit} className="category-form">
                            <div className="form-group">
                                <label htmlFor="categoryName">Category Name</label>
                                <input
                                    type="text"
                                    id="categoryName"
                                    value={formData.name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="Enter category name..."
                                    autoFocus
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Color</label>
                                <div className="color-picker">
                                    {COLOR_PALETTE.map(color => (
                                        <button
                                            key={color}
                                            type="button"
                                            className={`color-option ${formData.color === color ? 'selected' : ''}`}
                                            style={{ backgroundColor: color }}
                                            onClick={() => setFormData(prev => ({ ...prev, color }))}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div className="form-actions">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    {editingCategory ? 'Save Changes' : 'Add Category'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteConfirm && (
                <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
                    <div className="modal-content modal-confirm" onClick={(e) => e.stopPropagation()}>
                        <h3>Delete Category?</h3>
                        <p>Are you sure you want to delete <strong>"{deleteConfirm.name}"</strong>?</p>
                        {deleteConfirm.inUseCount > 0 && (
                            <p className="warning-text">
                                ⚠️ This category is used by {deleteConfirm.inUseCount} transaction{deleteConfirm.inUseCount !== 1 ? 's' : ''}.
                                Those transactions will keep their category but it won't appear in the list.
                            </p>
                        )}
                        <div className="form-actions">
                            <button className="btn btn-secondary" onClick={() => setDeleteConfirm(null)}>
                                Cancel
                            </button>
                            <button className="btn btn-danger" onClick={confirmDelete}>
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .categories-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
                    gap: 24px;
                }

                .categories-section {
                    background-color: var(--bg-card);
                    border-radius: 16px;
                    padding: 24px;
                }

                .section-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                }

                .section-header h2 {
                    font-size: 18px;
                    font-weight: 600;
                    margin: 0;
                    color: var(--text-primary);
                }

                .category-count {
                    font-size: 13px;
                    color: var(--text-secondary);
                }

                .category-list {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .category-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 12px 16px;
                    background-color: var(--bg-primary);
                    border-radius: 10px;
                    transition: background-color 0.2s;
                }

                .category-item:hover {
                    background-color: var(--bg-hover);
                }

                .category-info {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .category-color {
                    width: 12px;
                    height: 12px;
                    border-radius: 50%;
                    flex-shrink: 0;
                }

                .category-name {
                    font-weight: 500;
                    color: var(--text-primary);
                }

                .category-usage {
                    font-size: 12px;
                    color: var(--text-secondary);
                    background-color: var(--bg-secondary);
                    padding: 2px 8px;
                    border-radius: 10px;
                }

                .category-actions {
                    display: flex;
                    gap: 8px;
                    opacity: 0;
                    transition: opacity 0.2s;
                }

                .category-item:hover .category-actions {
                    opacity: 1;
                }

                .add-category-btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    padding: 12px;
                    background: transparent;
                    border: 2px dashed var(--border-color, rgba(255,255,255,0.1));
                    border-radius: 10px;
                    color: var(--text-secondary);
                    cursor: pointer;
                    transition: all 0.2s;
                    margin-top: 8px;
                }

                .add-category-btn:hover {
                    border-color: var(--accent-primary);
                    color: var(--accent-primary);
                    background-color: rgba(65, 105, 225, 0.1);
                }

                .color-picker {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 8px;
                }

                .color-option {
                    width: 32px;
                    height: 32px;
                    border-radius: 8px;
                    border: 2px solid transparent;
                    cursor: pointer;
                    transition: transform 0.2s, border-color 0.2s;
                }

                .color-option:hover {
                    transform: scale(1.1);
                }

                .color-option.selected {
                    border-color: var(--text-primary);
                    transform: scale(1.1);
                }

                .warning-text {
                    color: var(--accent-yellow);
                    background-color: rgba(255, 190, 10, 0.1);
                    padding: 12px;
                    border-radius: 8px;
                    font-size: 14px;
                }

                .category-form .form-group {
                    margin-bottom: 20px;
                }

                .action-btn {
                    width: 28px;
                    height: 28px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 6px;
                    border: none;
                    background: transparent;
                    color: var(--text-secondary);
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .action-btn:hover {
                    background-color: var(--bg-hover);
                }

                .action-btn.edit:hover {
                    color: var(--accent-blue);
                }

                .action-btn.delete:hover {
                    color: var(--accent-red);
                }

                @media (max-width: 768px) {
                    .categories-grid {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </div>
    )
}

export default Categories
