import { useState, useMemo } from 'react'
import { useData } from '../../context/DataContext'
import { formatCurrency } from '../../utils/calculations'

const TrashIcon = () => (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M2.5 4h11M5.5 4V2.5h5V4M6 7v6M10 7v6M3.5 4l1 10h7l1-10" />
    </svg>
)

const EditIcon = () => (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M9 2l5 5L7 14H2v-5l7-7z" />
    </svg>
)

const COLUMNS = [
    { key: 'id', label: 'ID', width: 80, editable: false },
    { key: 'type', label: 'Type', width: 80, editable: true },
    { key: 'name', label: 'Name', width: 150, editable: true },
    { key: 'company', label: 'Company', width: 150, editable: true },
    { key: 'amount', label: 'Amount', width: 100, editable: true },
    { key: 'category', label: 'Category', width: 120, editable: true },
    { key: 'frequency', label: 'Frequency', width: 100, editable: true },
    { key: 'date', label: 'Date', width: 110, editable: true },
    { key: 'description', label: 'Description', width: 200, editable: true }
]

function DataExplorer() {
    const { transactions, updateTransaction, deleteTransaction, currency } = useData()

    const [sortField, setSortField] = useState('date')
    const [sortDir, setSortDir] = useState('desc')
    const [filters, setFilters] = useState({})
    const [selectedRows, setSelectedRows] = useState(new Set())
    const [editingCell, setEditingCell] = useState(null)
    const [editValue, setEditValue] = useState('')
    const [visibleColumns, setVisibleColumns] = useState(
        COLUMNS.map(c => c.key)
    )

    // Filter and sort data
    const filteredData = useMemo(() => {
        let data = [...transactions]

        // Apply filters
        for (const [field, value] of Object.entries(filters)) {
            if (value) {
                data = data.filter(row =>
                    String(row[field]).toLowerCase().includes(value.toLowerCase())
                )
            }
        }

        // Sort
        data.sort((a, b) => {
            const aVal = a[sortField]
            const bVal = b[sortField]

            let cmp = 0
            if (typeof aVal === 'number' && typeof bVal === 'number') {
                cmp = aVal - bVal
            } else {
                cmp = String(aVal || '').localeCompare(String(bVal || ''))
            }

            return sortDir === 'desc' ? -cmp : cmp
        })

        return data
    }, [transactions, filters, sortField, sortDir])

    const handleSort = (field) => {
        if (sortField === field) {
            setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
        } else {
            setSortField(field)
            setSortDir('asc')
        }
    }

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({ ...prev, [field]: value }))
    }

    const toggleRowSelection = (id) => {
        setSelectedRows(prev => {
            const next = new Set(prev)
            if (next.has(id)) {
                next.delete(id)
            } else {
                next.add(id)
            }
            return next
        })
    }

    const selectAll = () => {
        if (selectedRows.size === filteredData.length) {
            setSelectedRows(new Set())
        } else {
            setSelectedRows(new Set(filteredData.map(r => r.id)))
        }
    }

    const deleteSelected = () => {
        if (selectedRows.size === 0) return
        if (!confirm(`Delete ${selectedRows.size} transactions?`)) return

        for (const id of selectedRows) {
            deleteTransaction(id)
        }
        setSelectedRows(new Set())
    }

    const startEditing = (id, field, currentValue) => {
        setEditingCell({ id, field })
        setEditValue(String(currentValue || ''))
    }

    const saveEdit = () => {
        if (!editingCell) return

        let value = editValue
        if (editingCell.field === 'amount') {
            value = parseFloat(value) || 0
        }

        updateTransaction(editingCell.id, { [editingCell.field]: value })
        setEditingCell(null)
        setEditValue('')
    }

    const cancelEdit = () => {
        setEditingCell(null)
        setEditValue('')
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            saveEdit()
        } else if (e.key === 'Escape') {
            cancelEdit()
        }
    }

    const toggleColumn = (key) => {
        setVisibleColumns(prev =>
            prev.includes(key)
                ? prev.filter(k => k !== key)
                : [...prev, key]
        )
    }

    const displayColumns = COLUMNS.filter(c => visibleColumns.includes(c.key))

    return (
        <div className="data-explorer">
            {/* Toolbar */}
            <div className="explorer-toolbar">
                <div className="toolbar-left">
                    <span className="row-count">{filteredData.length} transactions</span>
                    {selectedRows.size > 0 && (
                        <>
                            <span className="selected-count">{selectedRows.size} selected</span>
                            <button className="toolbar-btn danger" onClick={deleteSelected}>
                                <TrashIcon /> Delete Selected
                            </button>
                        </>
                    )}
                </div>

                <div className="toolbar-right">
                    <div className="column-toggle">
                        <span>Columns:</span>
                        {COLUMNS.map(col => (
                            <label key={col.key} className="column-checkbox">
                                <input
                                    type="checkbox"
                                    checked={visibleColumns.includes(col.key)}
                                    onChange={() => toggleColumn(col.key)}
                                />
                                {col.label}
                            </label>
                        ))}
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="explorer-table-wrapper">
                <table className="explorer-table">
                    <thead>
                        <tr className="header-row">
                            <th className="checkbox-col">
                                <input
                                    type="checkbox"
                                    checked={selectedRows.size === filteredData.length && filteredData.length > 0}
                                    onChange={selectAll}
                                />
                            </th>
                            {displayColumns.map(col => (
                                <th
                                    key={col.key}
                                    style={{ width: col.width }}
                                    onClick={() => handleSort(col.key)}
                                    className={sortField === col.key ? 'sorted' : ''}
                                >
                                    {col.label}
                                    {sortField === col.key && (
                                        <span className="sort-arrow">
                                            {sortDir === 'asc' ? ' ↑' : ' ↓'}
                                        </span>
                                    )}
                                </th>
                            ))}
                            <th className="actions-col">Actions</th>
                        </tr>
                        <tr className="filter-row">
                            <th></th>
                            {displayColumns.map(col => (
                                <th key={col.key}>
                                    <input
                                        type="text"
                                        placeholder="Filter..."
                                        value={filters[col.key] || ''}
                                        onChange={(e) => handleFilterChange(col.key, e.target.value)}
                                        className="filter-input"
                                    />
                                </th>
                            ))}
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredData.map(row => (
                            <tr
                                key={row.id}
                                className={selectedRows.has(row.id) ? 'selected' : ''}
                            >
                                <td className="checkbox-col">
                                    <input
                                        type="checkbox"
                                        checked={selectedRows.has(row.id)}
                                        onChange={() => toggleRowSelection(row.id)}
                                    />
                                </td>
                                {displayColumns.map(col => (
                                    <td
                                        key={col.key}
                                        className={col.editable ? 'editable' : ''}
                                        onDoubleClick={() => col.editable && startEditing(row.id, col.key, row[col.key])}
                                    >
                                        {editingCell?.id === row.id && editingCell?.field === col.key ? (
                                            <input
                                                type={col.key === 'amount' ? 'number' : 'text'}
                                                value={editValue}
                                                onChange={(e) => setEditValue(e.target.value)}
                                                onBlur={saveEdit}
                                                onKeyDown={handleKeyDown}
                                                autoFocus
                                                className="edit-input"
                                            />
                                        ) : (
                                            <span className={`cell-value ${col.key === 'type' ? row[col.key] : ''}`}>
                                                {col.key === 'amount'
                                                    ? formatCurrency(row[col.key], currency)
                                                    : row[col.key] || '-'}
                                            </span>
                                        )}
                                    </td>
                                ))}
                                <td className="actions-col">
                                    <button
                                        className="action-btn"
                                        onClick={() => {
                                            if (confirm('Delete this transaction?')) {
                                                deleteTransaction(row.id)
                                            }
                                        }}
                                        title="Delete"
                                    >
                                        <TrashIcon />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {filteredData.length === 0 && (
                <div className="empty-state">
                    No transactions found. Adjust your filters or add some data.
                </div>
            )}
        </div>
    )
}

export default DataExplorer
