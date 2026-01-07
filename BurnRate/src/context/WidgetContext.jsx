import { createContext, useContext, useState, useEffect } from 'react'

const WidgetContext = createContext()

const DEFAULT_WIDGET_ORDER = [
    { id: 'balance', name: 'Balance' },
    { id: 'expenses', name: 'Expenses' },
    { id: 'income', name: 'Income' },
    { id: 'goals', name: 'Goals' },
    { id: 'history', name: 'History' },
    { id: 'activity', name: 'Activity' },
]

const STORAGE_KEY = 'burnrate-widget-order'

export function WidgetProvider({ children }) {
    const [widgets, setWidgets] = useState(() => {
        // Try to load from localStorage
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem(STORAGE_KEY)
            if (saved) {
                try {
                    return JSON.parse(saved)
                } catch (e) {
                    console.error('Failed to parse saved widget order:', e)
                }
            }
        }
        return DEFAULT_WIDGET_ORDER
    })

    const [draggedWidget, setDraggedWidget] = useState(null)
    const [dragOverWidget, setDragOverWidget] = useState(null)

    // Save to localStorage when widgets change
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(widgets))
        }
    }, [widgets])

    const handleDragStart = (widgetId) => {
        setDraggedWidget(widgetId)
    }

    const handleDragEnd = () => {
        setDraggedWidget(null)
        setDragOverWidget(null)
    }

    const handleDragOver = (widgetId) => {
        if (widgetId !== draggedWidget) {
            setDragOverWidget(widgetId)
        }
    }

    const handleDragLeave = () => {
        setDragOverWidget(null)
    }

    const handleDrop = (targetWidgetId) => {
        if (!draggedWidget || draggedWidget === targetWidgetId) {
            handleDragEnd()
            return
        }

        setWidgets(prev => {
            const newWidgets = [...prev]
            const draggedIndex = newWidgets.findIndex(w => w.id === draggedWidget)
            const targetIndex = newWidgets.findIndex(w => w.id === targetWidgetId)

            if (draggedIndex === -1 || targetIndex === -1) {
                return prev
            }

            // Remove the dragged widget and insert it at the target position
            const [removed] = newWidgets.splice(draggedIndex, 1)
            newWidgets.splice(targetIndex, 0, removed)

            return newWidgets
        })

        handleDragEnd()
    }

    const resetOrder = () => {
        setWidgets(DEFAULT_WIDGET_ORDER)
    }

    const value = {
        widgets,
        draggedWidget,
        dragOverWidget,
        handleDragStart,
        handleDragEnd,
        handleDragOver,
        handleDragLeave,
        handleDrop,
        resetOrder,
    }

    return (
        <WidgetContext.Provider value={value}>
            {children}
        </WidgetContext.Provider>
    )
}

export function useWidgets() {
    const context = useContext(WidgetContext)
    if (!context) {
        throw new Error('useWidgets must be used within a WidgetProvider')
    }
    return context
}

export default WidgetContext
