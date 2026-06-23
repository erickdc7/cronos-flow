import { useState, useMemo } from 'react'
import CalendarHeatmap from 'react-calendar-heatmap'
import 'react-calendar-heatmap/dist/styles.css'
import { BarChart, Bar, LineChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Flame, BarChart3, TrendingUp } from 'lucide-react'

const tabs = [
    { id: 'heatmap', label: 'Actividad', icon: Flame },
    { id: 'bar', label: 'Progreso', icon: BarChart3 },
    { id: 'line', label: 'Tendencia', icon: TrendingUp },
]

// Read CSS variable values at runtime
const getCSSColor = (varName) => {
    return getComputedStyle(document.documentElement).getPropertyValue(varName).trim()
}

const StatsSection = ({ stats }) => {
    const [activeTab, setActiveTab] = useState('heatmap')

    // Prepare heatmap data
    const heatmapData = useMemo(() => {
        return stats.map(day => ({
            date: day.date,
            count: day.total > 0 ? Math.round((day.completed / day.total) * 100) : 0,
        }))
    }, [stats])

    // Heatmap date range: last 365 days
    const heatmapEndDate = new Date()
    const heatmapStartDate = new Date()
    heatmapStartDate.setFullYear(heatmapStartDate.getFullYear() - 1)

    // Classify heatmap values for color scale
    const classForValue = (value) => {
        if (!value || value.count === 0) return 'color-empty'
        if (value.count <= 25) return 'color-scale-1'
        if (value.count <= 50) return 'color-scale-2'
        if (value.count <= 75) return 'color-scale-3'
        return 'color-scale-4'
    }

    // Tooltip for heatmap
    const titleForValue = (value) => {
        if (!value || !value.date) return 'Sin datos'
        const date = new Date(value.date + 'T00:00:00')
        const formatted = date.toLocaleDateString('es-PE', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
        })
        return `${formatted}: ${value.count}% completado`
    }

    // Prepare bar chart data (last 14 days from stats)
    const barData = useMemo(() => {
        const last14 = stats.slice(-14)
        return last14.map(day => {
            const date = new Date(day.date + 'T00:00:00')
            return {
                date: date.toLocaleDateString('es-PE', { day: 'numeric', month: 'short' }),
                Completadas: day.completed,
                Total: day.total,
            }
        })
    }, [stats])

    // Prepare line chart data (all days)
    const lineData = useMemo(() => {
        return stats.map(day => {
            const date = new Date(day.date + 'T00:00:00')
            return {
                date: date.toLocaleDateString('es-PE', { day: 'numeric', month: 'short' }),
                fullDate: day.date,
                porcentaje: day.total > 0 ? Math.round((day.completed / day.total) * 100) : 0,
            }
        })
    }, [stats])

    // Colors from CSS vars (resolved at render time)
    const accentColor = getCSSColor('--color-accent') || '#10b981'
    const accentHover = getCSSColor('--color-accent-hover') || '#34d399'
    const zinc700 = getCSSColor('--color-zinc-700') || '#3f3f46'
    const zinc800 = getCSSColor('--color-zinc-800') || '#27272a'
    const textMuted = getCSSColor('--color-text-muted') || '#a1a1aa'
    const textDisabled = getCSSColor('--color-text-disabled') || '#71717a'

    const CustomTooltip = ({ active, payload, label }) => {
        if (!active || !payload || !payload.length) return null
        return (
            <div className="bg-[var(--color-zinc-900)] border border-[var(--color-border)] rounded-[var(--radius-lg)] px-3 py-2 shadow-lg">
                <p className="text-[var(--color-text-tertiary)] text-xs font-medium mb-1">{label}</p>
                {payload.map((entry, i) => (
                    <p key={i} className="text-xs" style={{ color: entry.color }}>
                        {entry.name}: <span className="font-mono font-medium">{entry.value}</span>
                    </p>
                ))}
            </div>
        )
    }

    const LineTooltip = ({ active, payload, label }) => {
        if (!active || !payload || !payload.length) return null
        return (
            <div className="bg-[var(--color-zinc-900)] border border-[var(--color-border)] rounded-[var(--radius-lg)] px-3 py-2 shadow-lg">
                <p className="text-[var(--color-text-tertiary)] text-xs font-medium mb-1">{label}</p>
                <p className="text-xs" style={{ color: accentHover }}>
                    Completado: <span className="font-mono font-medium">{payload[0].value}%</span>
                </p>
            </div>
        )
    }

    return (
        <div className="mt-[var(--space-12)]">
            <h2 className="text-[var(--color-text-primary)] text-2xl font-semibold tracking-tight mb-[var(--space-6)]">
                Estadísticas
            </h2>

            {/* Tabs */}
            <div className="flex items-center gap-[var(--space-1)] mb-[var(--space-5)] bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-[var(--space-1)] w-fit">
                {tabs.map(({ id, label, icon: Icon }) => (
                    <button
                        key={id}
                        onClick={() => setActiveTab(id)}
                        className={`
                            flex items-center gap-[var(--space-1-5)] px-[var(--space-3)] py-[var(--space-1-5)] rounded-[var(--radius-md)] text-xs font-medium transition-colors-base
                            ${activeTab === id
                                ? 'bg-[var(--color-bg-nav-active)] text-[var(--color-text-primary)]'
                                : 'text-[var(--color-text-disabled)] hover:text-[var(--color-text-tertiary)]'
                            }
                        `}
                    >
                        <Icon className="w-3.5 h-3.5" strokeWidth={activeTab === id ? 2 : 1.5} />
                        <span className="hidden sm:inline">{label}</span>
                    </button>
                ))}
            </div>

            {/* Chart content */}
            <div className="bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-[var(--radius-xl)] p-[var(--space-5)] overflow-x-auto">

                {/* Heatmap */}
                {activeTab === 'heatmap' && (
                    <div className="heatmap-container">
                        <CalendarHeatmap
                            startDate={heatmapStartDate}
                            endDate={heatmapEndDate}
                            values={heatmapData}
                            classForValue={classForValue}
                            titleForValue={titleForValue}
                            showWeekdayLabels
                            gutterSize={3}
                        />
                        {/* Legend */}
                        <div className="flex items-center justify-end gap-[var(--space-2)] mt-[var(--space-3)]">
                            <span className="text-[var(--color-text-disabled)] text-[10px]">Menos</span>
                            <div className="flex gap-[2px]">
                                <div className="w-[10px] h-[10px] rounded-[2px] bg-[var(--color-zinc-800)]" />
                                <div className="w-[10px] h-[10px] rounded-[2px] bg-[var(--color-emerald-950)]" />
                                <div className="w-[10px] h-[10px] rounded-[2px] bg-[var(--color-emerald-500-50)]" />
                                <div className="w-[10px] h-[10px] rounded-[2px] bg-[var(--color-emerald-500)]" />
                                <div className="w-[10px] h-[10px] rounded-[2px] bg-[var(--color-emerald-400)]" />
                            </div>
                            <span className="text-[var(--color-text-disabled)] text-[10px]">Más</span>
                        </div>
                    </div>
                )}

                {/* Bar Chart */}
                {activeTab === 'bar' && (
                    <div className="w-full h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={barData} barGap={2}>
                                <CartesianGrid strokeDasharray="3 3" stroke={zinc800} vertical={false} />
                                <XAxis
                                    dataKey="date"
                                    tick={{ fill: textDisabled, fontSize: 11 }}
                                    axisLine={{ stroke: zinc800 }}
                                    tickLine={false}
                                />
                                <YAxis
                                    tick={{ fill: textDisabled, fontSize: 11 }}
                                    axisLine={false}
                                    tickLine={false}
                                    allowDecimals={false}
                                />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(39, 39, 42, 0.4)' }} />
                                <Bar dataKey="Total" fill={zinc700} radius={[4, 4, 0, 0]} maxBarSize={28} />
                                <Bar dataKey="Completadas" fill={accentColor} radius={[4, 4, 0, 0]} maxBarSize={28} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}

                {/* Line Chart */}
                {activeTab === 'line' && (
                    <div className="w-full h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={lineData}>
                                <defs>
                                    <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={accentColor} stopOpacity={0.15} />
                                        <stop offset="95%" stopColor={accentColor} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke={zinc800} vertical={false} />
                                <XAxis
                                    dataKey="date"
                                    tick={{ fill: textDisabled, fontSize: 11 }}
                                    axisLine={{ stroke: zinc800 }}
                                    tickLine={false}
                                    interval="preserveStartEnd"
                                />
                                <YAxis
                                    tick={{ fill: textDisabled, fontSize: 11 }}
                                    axisLine={false}
                                    tickLine={false}
                                    domain={[0, 100]}
                                    tickFormatter={(v) => `${v}%`}
                                />
                                <Tooltip content={<LineTooltip />} />
                                <Area
                                    type="monotone"
                                    dataKey="porcentaje"
                                    stroke="none"
                                    fill="url(#lineGradient)"
                                />
                                <Line
                                    type="monotone"
                                    dataKey="porcentaje"
                                    stroke={accentHover}
                                    strokeWidth={2}
                                    dot={{ fill: accentColor, stroke: accentHover, strokeWidth: 2, r: 3 }}
                                    activeDot={{ fill: accentHover, stroke: accentHover, strokeWidth: 2, r: 5 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>
        </div>
    )
}

export default StatsSection
