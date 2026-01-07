import { useState } from 'react'
import { useWidgets } from '../../context/WidgetContext'

const ChevronDown = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 6L8 10L12 6" />
    </svg>
)

const DragHandle = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
        <circle cx="5" cy="4" r="1.5" />
        <circle cx="11" cy="4" r="1.5" />
        <circle cx="5" cy="8" r="1.5" />
        <circle cx="11" cy="8" r="1.5" />
        <circle cx="5" cy="12" r="1.5" />
        <circle cx="11" cy="12" r="1.5" />
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

    const {
        draggedWidget,
        dragOverWidget,
        handleDragStart,
        handleDragEnd,
        handleDragOver,
        handleDragLeave,
        handleDrop
    } = useWidgets()

    const handlePeriodChange = (period) => {
        setSelectedPeriod(period)
        setIsDropdownOpen(false)
        if (onPeriodChange) {
            onPeriodChange(period)
        }
    }

    const sizeClass = `size-${size}`
    const accentClass = accent ? `accent-${accent}` : ''
    const isDragging = draggedWidget === id
    const isDragOver = dragOverWidget === id

    const onDragStart = (e) => {
        e.dataTransfer.effectAllowed = 'move'
        e.dataTransfer.setData('text/plain', id)
        handleDragStart(id)
    }

    const onDragOver = (e) => {
        e.preventDefault()
        e.dataTransfer.dropEffect = 'move'
        handleDragOver(id)
    }

    const onDragLeave = (e) => {
        e.preventDefault()
        handleDragLeave()
    }

    const onDrop = (e) => {
        e.preventDefault()
        handleDrop(id)
    }

    const onDragEnd = () => {
        handleDragEnd()
    }

    return (
        <article
            className={`widget ${sizeClass} ${accentClass} ${isDragging ? 'dragging' : ''} ${isDragOver ? 'drag-over' : ''}`}
            draggable="true"
            onDragStart={onDragStart}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onDragEnd={onDragEnd}
            style={{ position: 'relative' }}
        >
            {/* Drag Handle */}
            <div className="widget-drag-handle" title="Drag to reorder">
                <DragHandle />
            </div>

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
