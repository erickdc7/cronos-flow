import { useState, useEffect } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'motion/react'
import { CheckCircle2, Circle, CalendarOff, ChevronRight } from 'lucide-react'
import { getHistory, getHistoryByDate } from '../lib/api'
import PageTransition from '../components/PageTransition'
import LoadingSpinner from '../components/LoadingSpinner'
import EmptyState from '../components/EmptyState'

const History = () => {
    const [logs, setLogs] = useState([])
    const [selectedLog, setSelectedLog] = useState(null)
    const [selectedEntries, setSelectedEntries] = useState([])
    const [loading, setLoading] = useState(true)
    const [loadingDetail, setLoadingDetail] = useState(false)
    const shouldReduceMotion = useReducedMotion()

    const fetchHistory = async () => {
        try {
            const { data } = await getHistory()
            setLogs(data)
        } catch (err) {
            console.error('Error al cargar historial:', err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchHistory()
        // eslint-disable-next-line react-hooks/set-state-in-effect
    }, [])

    const handleSelectDay = async (date) => {
        setLoadingDetail(true)
        try {
            const { data } = await getHistoryByDate(date)
            setSelectedLog(data.log)
            setSelectedEntries(data.entries)
        } catch (err) {
            console.error('Error al cargar detalle:', err)
        } finally {
            setLoadingDetail(false)
        }
    }

    const formatDate = (dateStr) => {
        const date = new Date(dateStr + 'T00:00:00')
        return date.toLocaleDateString('es-PE', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    const formatDateShort = (dateStr) => {
        const date = new Date(dateStr + 'T00:00:00')
        return date.toLocaleDateString('es-PE', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        })
    }

    if (loading) {
        return (
            <div className="min-h-[100dvh] flex items-center justify-center bg-zinc-950">
                <LoadingSpinner message="Cargando historial..." />
            </div>
        )
    }

    return (
        <div className="min-h-[100dvh] bg-zinc-950 px-4 py-6">
            <PageTransition>
                <div className="max-w-4xl mx-auto">

                    <h1 className="text-zinc-100 text-2xl font-semibold tracking-tight mb-6">Historial</h1>

                    {logs.length === 0 ? (
                        <EmptyState
                            icon={CalendarOff}
                            title="Aún no hay días registrados"
                            description="Cuando completes tu primer día, aparecerá aquí"
                        />
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-[1fr_1.2fr] gap-5">

                            {/* Day list */}
                            <div className="flex flex-col gap-2">
                                {logs.map((log, index) => {
                                    const isSelected = selectedLog?.date === log.date
                                    const pct = log.total > 0 ? Math.round((log.completed / log.total) * 100) : 0
                                    return (
                                        <motion.button
                                            key={log.id}
                                            onClick={() => handleSelectDay(log.date)}
                                            initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{
                                                duration: 0.3,
                                                delay: index * 0.03,
                                                ease: [0.23, 1, 0.32, 1]
                                            }}
                                            className={`
                                                text-left rounded-xl p-3.5 transition-all duration-200 group
                                                ${isSelected
                                                    ? 'bg-emerald-500/8 border border-emerald-500/25 ring-1 ring-emerald-500/10'
                                                    : 'bg-zinc-900/40 border border-zinc-800/50 hover:border-zinc-700/60 hover:bg-zinc-900/60'
                                                }
                                            `}
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <p className={`text-sm font-medium capitalize ${isSelected ? 'text-emerald-300' : 'text-zinc-300'}`}>
                                                    {formatDateShort(log.date)}
                                                </p>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-mono text-xs text-zinc-500 tabular-nums">
                                                        {log.completed}/{log.total}
                                                    </span>
                                                    <ChevronRight className={`w-3.5 h-3.5 transition-transform duration-200 ${isSelected ? 'text-emerald-400 translate-x-0.5' : 'text-zinc-700 group-hover:text-zinc-500'}`} strokeWidth={2} />
                                                </div>
                                            </div>

                                            {/* Progress bar */}
                                            <div className="bg-zinc-800/80 rounded-full h-1 overflow-hidden">
                                                <div
                                                    className={`h-1 rounded-full transition-all duration-500 ${isSelected ? 'bg-emerald-400' : 'bg-emerald-500/60'}`}
                                                    style={{ width: `${pct}%` }}
                                                />
                                            </div>
                                        </motion.button>
                                    )
                                })}
                            </div>

                            {/* Day detail */}
                            <div>
                                <AnimatePresence mode="wait">
                                    {loadingDetail ? (
                                        <motion.div
                                            key="loading"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="bg-zinc-900/40 border border-zinc-800/50 rounded-xl p-5 flex items-center justify-center h-48"
                                        >
                                            <LoadingSpinner message="" size="small" />
                                        </motion.div>
                                    ) : selectedLog ? (
                                        <motion.div
                                            key={selectedLog.date}
                                            initial={shouldReduceMotion ? false : { opacity: 0, x: 8 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -8 }}
                                            transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
                                            className="bg-zinc-900/40 border border-zinc-800/50 rounded-xl p-5 sticky top-20"
                                        >
                                            <h2 className="text-zinc-200 font-medium text-sm mb-4 capitalize">
                                                {formatDate(selectedLog.date)}
                                            </h2>
                                            <div className="flex flex-col gap-2">
                                                {selectedEntries.map(entry => (
                                                    <div
                                                        key={entry.id}
                                                        className={`
                                                            flex items-start gap-2.5 p-2.5 rounded-lg transition-colors duration-150
                                                            ${entry.done ? 'bg-emerald-950/25' : 'bg-zinc-800/30'}
                                                        `}
                                                    >
                                                        {entry.done ? (
                                                            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" strokeWidth={2} />
                                                        ) : (
                                                            <Circle className="w-4 h-4 text-zinc-600 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                                                        )}
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 flex-wrap">
                                                                <p className={`text-sm font-medium ${entry.done ? 'text-zinc-500 line-through' : 'text-zinc-200'}`}>
                                                                    {entry.title}
                                                                </p>
                                                                {entry.is_temp && (
                                                                    <span className="text-xs text-amber-400/80 bg-amber-400/8 border border-amber-400/15 px-1.5 py-0.5 rounded-full font-medium leading-none">
                                                                        Solo ese día
                                                                    </span>
                                                                )}
                                                            </div>
                                                            {entry.note && (
                                                                <p className="text-xs text-zinc-600 mt-1 italic leading-relaxed">
                                                                    {entry.note}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="empty"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="bg-zinc-900/40 border border-zinc-800/50 rounded-xl p-5 flex items-center justify-center h-48"
                                        >
                                            <p className="text-zinc-600 text-sm">
                                                Selecciona un día para ver el detalle
                                            </p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                        </div>
                    )}
                </div>
            </PageTransition>
        </div>
    )
}

export default History