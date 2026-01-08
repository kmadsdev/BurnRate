import { useNavigate } from 'react-router-dom'
import WidgetContainer from './WidgetContainer'
import { PieChart } from '../Charts'
import { useData } from '../../context/DataContext'
import { formatCurrency } from '../../utils/calculations'

function GoalsWidget({ size = '1x1' }) {
    const { goals, currency } = useData()
    const navigate = useNavigate()

    // Filter active goals (not completed)
    const activeGoals = goals?.filter(g => !g.completed) || []

    // Determine how many items to show based on size
    // 1x1: 1 goal
    // 2x1: 2 goals
    // 1x2: 3 goals (though 1x2 usually not standard for this, but just in case)
    const maxItems = size === '1x1' ? 1 : size === '2x1' ? 2 : 3
    const displayGoals = activeGoals.slice(0, maxItems)

    const handleGoalClick = (goalId) => {
        navigate('/goals')
    }

    return (
        <WidgetContainer
            id="goals"
            title="Goals"
            size={size}
            showPeriodSelector={false}
            onClick={() => navigate('/goals')}
        >
            <div className="goals-container" style={{
                display: 'flex',
                flexDirection: size === '2x1' ? 'row' : 'column',
                gap: '12px',
                height: '100%',
                alignItems: size === '2x1' ? 'center' : 'stretch',
                justifyContent: displayGoals.length > 0
                    ? (size === '2x1' ? 'space-around' : 'flex-start')
                    : 'center',
                paddingTop: displayGoals.length > 0 && size !== '2x1' ? '4px' : '0'
            }}>
                {displayGoals.length > 0 ? (
                    displayGoals.map((goal) => {
                        let percentage = 0
                        if (goal.targetAmount && goal.targetAmount > 0) {
                            percentage = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100))
                        }

                        return (
                            <div
                                key={goal.id}
                                className="goal-item"
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    cursor: 'pointer',
                                    flex: size === '2x1' ? 1 : 'initial',
                                    maxWidth: size === '2x1' ? '50%' : '100%'
                                }}
                                onClick={(e) => {
                                    e.stopPropagation()
                                    handleGoalClick(goal.id)
                                }}
                            >
                                <div className="goal-chart" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                    <PieChart
                                        percentage={percentage}
                                        size={50}
                                        strokeWidth={5}
                                        color={goal.color || "var(--accent-primary)"}
                                        backgroundColor={goal.color ? `${goal.color}33` : "var(--bg-hover)"}
                                        showLabel={false}
                                    />
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{
                                        fontSize: '13px',
                                        fontWeight: 500,
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        color: 'var(--text-primary)'
                                    }}>
                                        {goal.title}
                                    </div>
                                    <div style={{
                                        fontSize: '11px',
                                        color: 'var(--text-muted)',
                                        marginTop: '2px'
                                    }}>
                                        <div className="goal-info">
                                            <h4 className="goal-title">{goal.title}</h4>
                                            <span className="goal-amount">
                                                {formatCurrency(goal.currentAmount || 0, currency)} / {formatCurrency(goal.targetAmount || 0, currency)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    })
                ) : (
                    <div style={{
                        textAlign: 'center',
                        color: 'var(--text-muted)',
                        fontSize: '13px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        <span>No active goals</span>
                        <div style={{ fontSize: '11px', opacity: 0.7 }}>Add a goal to track progress</div>
                    </div>
                )}
            </div>
        </WidgetContainer>
    )
}

export default GoalsWidget
