import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const WidgetContext = createContext()

// Widget definitions with size constraints
export const WIDGET_DEFINITIONS = {
    balance: {
        id: 'balance',
        name: 'Balance',
        sizes: ['1x1'],
        defaultSize: '1x1',
        mandatory: true,
    },
    expenses: {
        id: 'expenses',
        name: 'Expenses',
        sizes: ['1x1'],
        defaultSize: '1x1',
        mandatory: false,
    },
    income: {
        id: 'income',
        name: 'Income',
        sizes: ['1x1'],
        defaultSize: '1x1',
        mandatory: false,
    },
    goals: {
        id: 'goals',
        name: 'Goals',
        sizes: ['1x1', '2x1'],
        defaultSize: '1x1',
        mandatory: false,
    },
    history: {
        id: 'history',
        name: 'History',
        sizes: ['2x1'],
        defaultSize: '2x1',
        mandatory: false,
    },
    activity: {
        id: 'activity',
        name: 'Activity',
        sizes: ['1x1', '2x1', '1x2'],
        defaultSize: '2x1',
        mandatory: false,
    },
    subscriptions: {
        id: 'subscriptions',
        name: 'Subscriptions',
        sizes: ['1x1', '2x1'],
        defaultSize: '1x1',
        mandatory: false,
    },
}

const DEFAULT_WIDGETS = [
    { id: 'balance', size: '1x1' },
    { id: 'expenses', size: '1x1' },
    { id: 'income', size: '1x1' },
    { id: 'goals', size: '1x1' },
    { id: 'history', size: '2x1' },
    { id: 'activity', size: '2x1' },
]

const STORAGE_KEY = 'burnrate-widget-config'
const DEFAULTS_STORAGE_KEY = 'burnrate-widget-defaults'
const GRID_STORAGE_KEY = 'burnrate-grid-layout'

const DEFAULT_GRID = { columns: 4, rows: 3 }

export function WidgetProvider({ children }) {
    // Edit mode state
    const [editMode, setEditMode] = useState(false)

    // Active widgets (what's shown on dashboard)
    const [widgets, setWidgets] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem(STORAGE_KEY)
            if (saved) {
                try {
                    return JSON.parse(saved)
                } catch (e) {
                    console.error('Failed to parse saved widget config:', e)
                }
            }
        }
        return DEFAULT_WIDGETS
    })

    // Default widgets configuration
    const [defaultWidgets, setDefaultWidgets] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem(DEFAULTS_STORAGE_KEY)
            if (saved) {
                try {
                    return JSON.parse(saved)
                } catch (e) {
                    console.error('Failed to parse saved defaults:', e)
                }
            }
        }
        return DEFAULT_WIDGETS
    })


    // Grid layout configuration
    const [gridLayout, setGridLayout] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem(GRID_STORAGE_KEY)
            if (saved) {
                try {
                    return JSON.parse(saved)
                } catch (e) {
                    console.error('Failed to parse saved grid layout:', e)
                }
            }
        }
        return DEFAULT_GRID
    })

    // Drag state
    const [draggedWidget, setDraggedWidget] = useState(null)
    const [dragOverWidget, setDragOverWidget] = useState(null)
    const [dropPosition, setDropPosition] = useState(null) // 'left' | 'right' | null

    // Save to localStorage
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(widgets))
        }
    }, [widgets])

    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem(DEFAULTS_STORAGE_KEY, JSON.stringify(defaultWidgets))
        }
    }, [defaultWidgets])

    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem(GRID_STORAGE_KEY, JSON.stringify(gridLayout))
        }
    }, [gridLayout])

    // Toggle edit mode
    const toggleEditMode = useCallback(() => {
        setEditMode(prev => !prev)
        // Reset drag state when exiting edit mode
        setDraggedWidget(null)
        setDragOverWidget(null)
        setDropPosition(null)
    }, [])

    // Add widget
    const addWidget = useCallback((widgetId) => {
        const definition = WIDGET_DEFINITIONS[widgetId]
        if (!definition) return

        // Check if already exists
        if (widgets.some(w => w.id === widgetId)) return

        setWidgets(prev => {
            // Find first empty slot to replace, or append
            const emptyIndex = prev.findIndex(w => w.isPlaceholder)

            if (emptyIndex !== -1) {
                const newWidgets = [...prev]
                newWidgets[emptyIndex] = { id: widgetId, size: definition.defaultSize }
                return newWidgets
            }

            return [...prev, { id: widgetId, size: definition.defaultSize }]
        })
    }, [widgets])

    // Remove widget (can't remove mandatory)
    // NOW: Replaces with a placeholder to keep grid position stable
    const removeWidget = useCallback((widgetId) => {
        const definition = WIDGET_DEFINITIONS[widgetId]
        if (definition?.mandatory) return

        setWidgets(prev => prev.map(w => {
            if (w.id === widgetId) {
                // Return a placeholder structure
                // We generate a unique ID based on time or random
                return {
                    id: `empty-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                    size: '1x1', // Default placeholder size
                    isPlaceholder: true // Flag for rendering
                }
            }
            return w
        }))
    }, [])

    // Change widget size
    const changeWidgetSize = useCallback((widgetId, newSize) => {
        const definition = WIDGET_DEFINITIONS[widgetId]
        if (!definition || !definition.sizes.includes(newSize)) return

        setWidgets(prev => prev.map(w =>
            w.id === widgetId ? { ...w, size: newSize } : w
        ))
    }, [])

    // Get available sizes for a widget
    const getAvailableSizes = useCallback((widgetId) => {
        return WIDGET_DEFINITIONS[widgetId]?.sizes || ['1x1']
    }, [])

    // Get widgets not currently on dashboard
    const getAvailableWidgets = useCallback(() => {
        const activeIds = widgets.map(w => w.id)
        return Object.values(WIDGET_DEFINITIONS).filter(w => !activeIds.includes(w.id))
    }, [widgets])

    // Drag handlers
    const handleDragStart = useCallback((widgetId) => {
        if (!editMode) return
        setDraggedWidget(widgetId)
    }, [editMode])

    const handleDragEnd = useCallback(() => {
        setDraggedWidget(null)
        setDragOverWidget(null)
        setDropPosition(null)
    }, [])

    const handleDragOver = useCallback((widgetId, position = null) => {
        if (!editMode || widgetId === draggedWidget) return
        setDragOverWidget(widgetId)
        setDropPosition(position)
    }, [editMode, draggedWidget])

    const handleDragLeave = useCallback(() => {
        setDragOverWidget(null)
        setDropPosition(null)
    }, [])

    const handleDrop = useCallback((targetWidgetId, position = null) => {
        if (!editMode || !draggedWidget || draggedWidget === targetWidgetId) {
            handleDragEnd()
            return
        }

        setWidgets(prev => {
            const newWidgets = [...prev]
            const draggedIndex = newWidgets.findIndex(w => w.id === draggedWidget)
            const targetIndex = newWidgets.findIndex(w => w.id === targetWidgetId)

            if (draggedIndex === -1 || targetIndex === -1) return prev

            // Swap logic (Android style)
            const draggedItem = newWidgets[draggedIndex]
            const targetItem = newWidgets[targetIndex]

            // Swap them
            newWidgets[draggedIndex] = targetItem
            newWidgets[targetIndex] = draggedItem

            return newWidgets
        })

        handleDragEnd()
    }, [editMode, draggedWidget, handleDragEnd])

    // Reset to defaults
    const resetToDefaults = useCallback(() => {
        const totalSlots = gridLayout.columns * gridLayout.rows
        let currentSlots = 0
        const newWidgets = []

        // Add default widgets first
        for (const def of defaultWidgets) {
            const [w, h] = def.size.split('x').map(Number)
            if (currentSlots + (w * h) <= totalSlots) {
                newWidgets.push(def)
                currentSlots += (w * h)
            }
        }

        // Fill the rest with placeholders
        while (currentSlots < totalSlots) {
            newWidgets.push({
                id: `empty-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                size: '1x1',
                isPlaceholder: true
            })
            currentSlots++
        }

        setWidgets(newWidgets)
    }, [defaultWidgets, gridLayout])

    // Save current as defaults
    const saveAsDefaults = useCallback(() => {
        setDefaultWidgets(widgets)
    }, [widgets])

    // Update defaults
    const updateDefaults = useCallback((newDefaults) => {
        setDefaultWidgets(newDefaults)
    }, [])

    const updateGridLayout = useCallback((layout) => {
        setGridLayout(layout)
    }, [])

    const value = {
        // State
        widgets,
        editMode,
        draggedWidget,
        dragOverWidget,
        dropPosition,
        defaultWidgets,
        gridLayout,

        // Actions
        toggleEditMode,
        addWidget,
        removeWidget,
        changeWidgetSize,
        getAvailableSizes,
        getAvailableWidgets,
        resetToDefaults,
        saveAsDefaults,
        updateDefaults,
        updateGridLayout,
        updateWidgetsList: setWidgets,

        // Drag handlers
        handleDragStart,
        handleDragEnd,
        handleDragOver,
        handleDragLeave,
        handleDrop,

        // Constants
        WIDGET_DEFINITIONS,
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
