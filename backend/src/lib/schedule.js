/**
 * Checks if an activity's schedule matches a given date.
 * @param {string} schedule - The schedule type: 'daily', 'weekdays', 'mon-wed-fri', 
 * 'tue-thu', 'weekends', 'custom:1,3,5' (comma-separated day numbers 0-6), or 'YYYY-MM-DD'
 * @param {string} dateStr - The date to check in 'YYYY-MM-DD' format
 * @returns {boolean}
 */
function matchesSchedule(schedule, dateStr) {
    if (!schedule || schedule === 'daily') return true

    const date = new Date(dateStr + 'T00:00:00')
    const day = date.getDay() // 0=Sun, 1=Mon, ..., 6=Sat

    // Custom days: 'custom:1,3,5'
    if (schedule.startsWith('custom:')) {
        const days = schedule.replace('custom:', '').split(',').map(Number)
        return days.includes(day)
    }

    switch (schedule) {
        case 'weekdays':
            return day >= 1 && day <= 5
        case 'mon-wed-fri':
            return [1, 3, 5].includes(day)
        case 'tue-thu':
            return [2, 4].includes(day)
        case 'weekends':
            return day === 0 || day === 6
        default:
            // Specific date: schedule is 'YYYY-MM-DD'
            return schedule === dateStr
    }
}

/**
 * Checks if a schedule value represents a specific date (not a recurring pattern).
 */
function isSpecificDate(schedule) {
    return /^\d{4}-\d{2}-\d{2}$/.test(schedule)
}

/**
 * Converts a custom schedule string to a human-readable label in Spanish.
 * @param {string} schedule 
 * @returns {string}
 */
function getScheduleLabel(schedule) {
    if (!schedule || schedule === 'daily') return 'Diaria'

    if (schedule.startsWith('custom:')) {
        const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
        const days = schedule.replace('custom:', '').split(',').map(Number)
        return days.map(d => dayNames[d]).join(', ')
    }

    const labels = {
        weekdays: 'Lun - Vie',
        'mon-wed-fri': 'Lun, Mié, Vie',
        'tue-thu': 'Mar, Jue',
        weekends: 'Sáb - Dom'
    }

    if (labels[schedule]) return labels[schedule]
    if (isSpecificDate(schedule)) return schedule
    return schedule
}

module.exports = { matchesSchedule, isSpecificDate, getScheduleLabel }