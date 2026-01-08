import { useState } from 'react'
import { useWidgets, WIDGET_DEFINITIONS } from '../../context/WidgetContext'

const ChevronDown = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 6L8 10L12 6" />
    </svg>
)

const DragHandle = () => (
    <svg width="24" height="16" viewBox="0 0 24 16" fill="currentColor">
        <rect x="4" y="3" width="16" height="2" rx="1" />
        <rect x="4" y="7" width="16" height="2" rx="1" />
        <rect x="4" y="11" width="16" height="2" rx="1" />
    </svg>
)

const RemoveIcon = () => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M3 3L11 11M11 3L3 11" />
    </svg>
)

const SizeIcon = () => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="1" width="5" height="5" rx="1" />
        <rect x="8" y="1" width="5" height="5" rx="1" />
        <rect x="1" y="8" width="12" height="5" rx="1" />
    </svg>
)

function WidgetContainer({
    id,
    title,
    size = '1x1',
    accent = '',
    icon = null,
    showPeriodSelector = true,
    periodOptions = ['7 days', '30 days', '90 days'],
    defaultPeriod = '7 days',
    onPeriodChange,
    children
}) {
    const [selectedPeriod, setSelectedPeriod] = useState(defaultPeriod)
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const [isSizeDropdownOpen, setIsSizeDropdownOpen] = useState(false)

    const {
        editMode,
        draggedWidget,
        dragOverWidget,
        dropPosition,
        handleDragStart,
        handleDragEnd,
        handleDragOver,
        handleDragLeave,
        handleDrop,
        removeWidget,
        changeWidgetSize,
        getAvailableSizes,
    } = useWidgets()

    const definition = WIDGET_DEFINITIONS[id]
    const availableSizes = getAvailableSizes(id)
    const canResize = availableSizes.length > 1
    const canRemove = !definition?.mandatory

    const handlePeriodChange = (period) => {
        setSelectedPeriod(period)
        setIsDropdownOpen(false)
        if (onPeriodChange) {
            onPeriodChange(period)
        }
    }

    const handleSizeChange = (newSize) => {
        changeWidgetSize(id, newSize)
        setIsSizeDropdownOpen(false)
    }

    const handleRemove = (e) => {
        e.stopPropagation()
        removeWidget(id)
    }

    const sizeClass = `size-${size}`
    const accentClass = accent ? `accent-${accent}` : ''
    const isDragging = draggedWidget === id
    const isDragOver = dragOverWidget === id
    const isWide = size === '2x1' || size === '3x1'

    const onDragStart = (e) => {
        if (!editMode) {
            e.preventDefault()
            return
        }
        e.dataTransfer.effectAllowed = 'move'
        e.dataTransfer.setData('text/plain', id)
        // Delay to allow the drag image to be set
        setTimeout(() => handleDragStart(id), 0)
    }

    const onDragOver = (e) => {
        if (!editMode) return
        e.preventDefault()
        e.dataTransfer.dropEffect = 'move'

        // For wide widgets, determine left/right position
        if (isWide) {
            const rect = e.currentTarget.getBoundingClientRect()
            const midpoint = rect.left + rect.width / 2
            const position = e.clientX < midpoint ? 'left' : 'right'
            handleDragOver(id, position)
        } else {
            handleDragOver(id, null)
        }
    }

    const onDragLeave = (e) => {
        if (!editMode) return
        e.preventDefault()
        handleDragLeave()
    }

    const onDrop = (e) => {
        if (!editMode) return
        e.preventDefault()

        if (isWide) {
            const rect = e.currentTarget.getBoundingClientRect()
            const midpoint = rect.left + rect.width / 2
            const position = e.clientX < midpoint ? 'left' : 'right'
            handleDrop(id, position)
        } else {
            handleDrop(id, null)
        }
    }

    const onDragEnd = () => {
        handleDragEnd()
    }

    return (
        <article
            className={`widget ${sizeClass} ${accentClass} ${isDragging ? 'dragging' : ''} ${isDragOver ? 'drag-over' : ''} ${editMode ? 'edit-mode' : ''}`}
            draggable={editMode}
            onDragStart={onDragStart}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onDragEnd={onDragEnd}
        >
            {/* Edit Mode Controls */}
            <div className="widget-edit-controls">
                {canResize && (
                    <div className="widget-size-selector">
                        <button
                            className="widget-size-btn"
                            onClick={(e) => {
                                e.stopPropagation()
                                setIsSizeDropdownOpen(!isSizeDropdownOpen)
                            }}
                            title="Change size"
                        >
                            <SizeIcon />
                        </button>
                        {isSizeDropdownOpen && (
                            <div className="widget-size-dropdown">
                                {availableSizes.map(s => (
                                    <button
                                        key={s}
                                        className={`widget-size-option ${s === size ? 'active' : ''}`}
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            handleSizeChange(s)
                                        }}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}
                {canRemove && (
                    <button
                        className="widget-remove-btn"
                        onClick={handleRemove}
                        title="Remove widget"
                    >
                        <RemoveIcon />
                    </button>
                )}
            </div>

            {/* Drag Handle */}
            <div className="widget-drag-handle" title="Drag to reorder">
                <DragHandle />
            </div>

            {/* Drop zones for wide widgets */}
            {isWide && isDragOver && (
                <div className="widget-drop-zones">
                    <div
                        className={`widget-drop-zone ${dropPosition === 'left' ? 'active' : ''}`}
                        onDragOver={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            handleDragOver(id, 'left')
                        }}
                        onDrop={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            handleDrop(id, 'left')
                        }}
                    >
                        <span className="widget-drop-zone-label">Left</span>
                    </div>
                    <div
                        className={`widget-drop-zone ${dropPosition === 'right' ? 'active' : ''}`}
                        onDragOver={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            handleDragOver(id, 'right')
                        }}
                        onDrop={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            handleDrop(id, 'right')
                        }}
                    >
                        <span className="widget-drop-zone-label">Right</span>
                    </div>
                </div>
            )}

            <header className="widget-header">
                <div className="widget-header-left">
                    {icon && (
                        <div className="widget-icon-circle">
                            {icon}
                        </div>
                    )}
                    <h3 className="widget-title">{title}</h3>
                </div>

                {showPeriodSelector && (
                    <div className="widget-period-wrapper">
                        <button
                            className="widget-period-selector"
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            aria-expanded={isDropdownOpen}
                            aria-haspopup="listbox"
                        >
                            <span>{selectedPeriod}</span>
                            <ChevronDown />
                        </button>

                        {isDropdownOpen && (
                            <ul className="widget-period-dropdown" role="listbox">
                                {periodOptions.map((option) => (
                                    <li key={option}>
                                        <button
                                            className={`widget-period-option ${option === selectedPeriod ? 'active' : ''}`}
                                            onClick={() => handlePeriodChange(option)}
                                            role="option"
                                            aria-selected={option === selectedPeriod}
                                        >
                                            {option}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                )}
            </header>

            {children}
        </article>
    )
}

export default WidgetContainer
