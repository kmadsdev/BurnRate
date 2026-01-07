// Mock data for BurnRate dashboard widgets
// Structured for easy API integration later

export const balanceData = {
    current: 4500.00,
    currency: '$',
    history: {
        '7days': [
            { day: 'Mon', value: 65 },
            { day: 'Tue', value: 45 },
            { day: 'Wed', value: 80 },
            { day: 'Thu', value: 55 },
            { day: 'Fri', value: 90 },
            { day: 'Sat', value: 70 },
            { day: 'Sun', value: 60 },
        ],
        '30days': Array.from({ length: 30 }, (_, i) => ({
            day: `Day ${i + 1}`,
            value: Math.floor(Math.random() * 100) + 20,
        })),
        '90days': Array.from({ length: 90 }, (_, i) => ({
            day: `Day ${i + 1}`,
            value: Math.floor(Math.random() * 100) + 20,
        })),
    },
}

export const expensesData = {
    total: 4500.00,
    currency: '$',
    accentColor: '#FF4F79',
    history: [
        { month: 'Jan', value: 3200 },
        { month: 'Feb', value: 3800 },
        { month: 'Mar', value: 3500 },
        { month: 'Apr', value: 4200 },
        { month: 'May', value: 3900 },
        { month: 'Jun', value: 4500 },
    ],
    chartPoints: [
        { x: 0, y: 70 },
        { x: 20, y: 50 },
        { x: 40, y: 65 },
        { x: 60, y: 40 },
        { x: 80, y: 55 },
        { x: 100, y: 30 },
    ],
}

export const incomeData = {
    total: 9900.00,
    currency: '$',
    accentColor: '#61E813',
    history: [
        { month: 'Jan', value: 8500 },
        { month: 'Feb', value: 9200 },
        { month: 'Mar', value: 8800 },
        { month: 'Apr', value: 9500 },
        { month: 'May', value: 9100 },
        { month: 'Jun', value: 9900 },
    ],
    chartPoints: [
        { x: 0, y: 40 },
        { x: 20, y: 55 },
        { x: 40, y: 45 },
        { x: 60, y: 70 },
        { x: 80, y: 60 },
        { x: 100, y: 75 },
    ],
}

export const historyData = {
    labels: ['2k', '4k', '6k', '8k', '10k'],
    timeline: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
    income: [
        { month: 'Jan', value: 6500, predicted: false },
        { month: 'Feb', value: 7200, predicted: false },
        { month: 'Mar', value: 6800, predicted: false },
        { month: 'Apr', value: 7500, predicted: false },
        { month: 'May', value: 7100, predicted: false },
        { month: 'Jun', value: 8000, predicted: false },
        { month: 'Jul', value: 7800, predicted: true },
        { month: 'Aug', value: 8200, predicted: true },
        { month: 'Sep', value: 8500, predicted: true },
        { month: 'Oct', value: 8800, predicted: true },
    ],
    outcome: [
        { month: 'Jan', value: 4200, predicted: false },
        { month: 'Feb', value: 5500, predicted: false },
        { month: 'Mar', value: 4800, predicted: false },
        { month: 'Apr', value: 6200, predicted: false },
        { month: 'May', value: 5100, predicted: false },
        { month: 'Jun', value: 5800, predicted: false },
        { month: 'Jul', value: 5500, predicted: true },
        { month: 'Aug', value: 5200, predicted: true },
        { month: 'Sep', value: 5000, predicted: true },
        { month: 'Oct', value: 4800, predicted: true },
    ],
}

export const goalsData = [
    {
        id: 1,
        name: 'Dev Fund',
        target: 5000,
        current: 3500,
        percentage: 70,
        color: '#4169E1',
    },
    {
        id: 2,
        name: 'Tax',
        target: 3000,
        current: 1800,
        percentage: 60,
        color: '#FFBE0A',
    },
    {
        id: 3,
        name: 'Food',
        target: 800,
        current: 520,
        percentage: 65,
        color: '#FF4F79',
    },
]

export const activityData = {
    categories: [
        { name: 'Business', value: 35, color: '#4169E1' },
        { name: 'Subscriptions', value: 25, color: '#FF4F79' },
        { name: 'Cloud Services', value: 20, color: '#FFBE0A' },
        { name: 'Tools', value: 12, color: '#61E813' },
        { name: 'Other', value: 8, color: '#A7A8AB' },
    ],
}

export const cloudExpensesData = {
    services: [
        { name: 'AWS', value: 450, color: '#FF9900' },
        { name: 'GCP', value: 280, color: '#4285F4' },
        { name: 'Vercel', value: 120, color: '#000000' },
        { name: 'CloudFlare', value: 85, color: '#F38020' },
    ],
    total: 935,
    history: [
        { month: 'Jan', value: 720 },
        { month: 'Feb', value: 780 },
        { month: 'Mar', value: 850 },
        { month: 'Apr', value: 890 },
        { month: 'May', value: 920 },
        { month: 'Jun', value: 935 },
    ],
    predictions: [
        { month: 'Jul', value: 960 },
        { month: 'Aug', value: 1010 },
        { month: 'Sep', value: 1050 },
    ],
}
