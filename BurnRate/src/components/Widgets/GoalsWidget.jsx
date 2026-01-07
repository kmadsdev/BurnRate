import WidgetContainer from './WidgetContainer'
import { PieChart } from '../Charts'
import { goalsData } from '../../data/mockData'

function GoalsWidget() {
    return (
        <WidgetContainer
            id="goals"
            title="Goals"
            size="1x1"
            showPeriodSelector={false}
        >
            <div className="goals-container">
                {goalsData.map((goal) => (
                    <div key={goal.id} className="goal-item">
                        <div className="goal-chart">
                            <PieChart
                                percentage={goal.percentage}
                                size={80}
                                strokeWidth={6}
                                color={goal.color}
                                backgroundColor="rgba(0, 0, 0, 0.06)"
                                showLabel={true}
                                value={`${goal.percentage}%`}
                                label=""
                            />
                        </div>
                        <span className="goal-label">{goal.name}</span>
                    </div>
                ))}
            </div>
        </WidgetContainer>
    )
}

export default GoalsWidget
