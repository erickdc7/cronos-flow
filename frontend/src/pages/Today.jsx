import { useState, useEffect } from 'react'
import { LayoutGroup, useReducedMotion } from 'motion/react'
import confetti from 'canvas-confetti'
import { Plus, ListChecks } from 'lucide-react'
import { getToday, addTempEntry } from '../lib/api'
import ActivityItem from '../components/ActivityItem'
import ProgressRing from '../components/ProgressRing'
import PageTransition from '../components/PageTransition'
import LoadingSpinner from '../components/LoadingSpinner'
import EmptyState from '../components/EmptyState'

const Today = () => {
    const [log, setLog] = useState(null)
    const shouldReduceMotion = useReducedMotion()
    const [entries, setEntries] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [showTempForm, setShowTempForm] = useState(false)
    const [tempTitle, setTempTitle] = useState('')
    const [addingTemp, setAddingTemp] = useState(false)

    // Stats
    const completed = entries.filter(e => e.done).length
    const total = entries.length
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0

    const fireConfetti = () => {
        if (shouldReduceMotion) return

        confetti({
            particleCount: 120,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['var(--color-accent-subtle)', 'var(--color-accent)', 'var(--color-accent-light)', 'var(--color-accent-lighter)']
        })
    }

    const fetchToday = async () => {
        try {
            setLoading(true)
            const { data } = await getToday()
            setLog(data.log)
            const sorted = [...data.entries].sort((a, b) => {
                if (a.done !== b.done) return a.done ? 1 : -1
                return a.title.localeCompare(b.title)
            })
            setEntries(sorted)
        } catch (err) {
            console.error(err)
            setError('Error al cargar las actividades')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchToday()
        // eslint-disable-next-line react-hooks/set-state-in-effect
    }, [])

    useEffect(() => {
        if (total === 0 || !log) return

        const today = new Date().toLocaleDateString('en-CA')
        const storageKey = `confetti_shown_${log.user_id}_${today}`
        const alreadyShown = localStorage.getItem(storageKey) === 'true'

        if (completed === total && !alreadyShown) {
            localStorage.setItem(storageKey, 'true')
            fireConfetti()
        }
    }, [completed, total, log])

    const handleUpdate = (updatedEntry) => {
        setEntries(prev => {
            const updated = prev.map(e => e.id === updatedEntry.id ? updatedEntry : e)
            return updated.sort((a, b) => {
                if (a.done !== b.done) return a.done ? 1 : -1
                return a.title.localeCompare(b.title)
            })
        })
    }

    const handleDelete = (deletedId) => {
        setEntries(prev => prev.filter(e => e.id !== deletedId))
    }

    const handleAddTemp = async (e) => {
        e.preventDefault()
        if (!tempTitle.trim()) return
        setAddingTemp(true)
        try {
            const { data } = await addTempEntry(log.id, tempTitle.trim())
            setEntries(prev => [...prev, data])
            setTempTitle('')
            setShowTempForm(false)
        } catch (err) {
            console.error('Error al agregar actividad temporal:', err)
        } finally {
            setAddingTemp(false)
        }
    }

    // Formatted date
    const today = new Date()
    const dateLabel = today.toLocaleDateString('es-PE', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })

    if (loading) {
        return (
            <div className="min-h-[100dvh] flex items-center justify-center bg-[var(--color-bg)]">
                <LoadingSpinner message="Cargando tu día..." />
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-[100dvh] flex items-center justify-center bg-[var(--color-bg)]">
                <p className="text-[var(--color-error)] text-sm">{error}</p>
            </div>
        )
    }



    return (
        <div className="min-h-[100dvh] bg-[var(--color-bg)] px-[var(--space-4)] py-[var(--space-6)]">
            <PageTransition>
                <div className="max-w-2xl mx-auto">

                    {/* Day header */}
                    <div className="mb-[var(--space-8)]">
                        <div className="flex items-start justify-between gap-[var(--space-4)]">
                            <div className="flex-1">
                                <p className="text-[var(--color-text-disabled)] text-xs font-medium uppercase tracking-wide mb-[var(--space-1)] capitalize">{dateLabel}</p>
                                <h1 className="text-[var(--color-text-primary)] text-2xl font-semibold tracking-tight">Tu día</h1>

                                {/* Linear progress bar */}
                                <div className="flex items-center gap-[var(--space-3)] mt-[var(--space-4)]">
                                    <div className="flex-1 bg-[var(--color-zinc-800-80)] rounded-[var(--radius-full)] h-1.5 overflow-hidden">
                                        <div
                                            className="bg-[var(--color-accent)] h-1.5 rounded-[var(--radius-full)] transition-width duration-[var(--transition-slowest)] ease-out"
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                    <span className="font-mono text-xs text-[var(--color-text-disabled)] tabular-nums whitespace-nowrap">
                                        {completed}/{total}
                                    </span>
                                </div>
                            </div>

                            {/* Progress ring */}
                            {total > 0 && (
                                <ProgressRing percentage={percentage} size={72} strokeWidth={5} />
                            )}
                        </div>
                    </div>

                    {/* Activity list */}
                    {entries.length === 0 ? (
                        <EmptyState
                            icon={ListChecks}
                            title="No tienes actividades para hoy"
                            description='Ve a "Actividades" para agregar tus rutinas diarias'
                        />
                    ) : (
                        <LayoutGroup>
                            <div className="flex flex-col gap-[var(--space-2-5)] mb-[var(--space-5)]">
                                {entries.map((entry, index) => (
                                    <ActivityItem
                                        key={entry.id}
                                        entry={entry}
                                        onUpdate={handleUpdate}
                                        onDelete={handleDelete}
                                        index={index}
                                    />
                                ))}
                            </div>
                        </LayoutGroup>
                    )}

                    {/* Add temporary activity */}
                    {showTempForm ? (
                        <form onSubmit={handleAddTemp} className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-[var(--radius-xl)] p-[var(--space-4)]">
                            <p className="text-[var(--color-text-disabled)] text-xs mb-[var(--space-3)] font-medium">
                                Esta actividad solo aparecerá hoy
                            </p>
                            <input
                                type="text"
                                value={tempTitle}
                                onChange={(e) => setTempTitle(e.target.value)}
                                placeholder="Nombre de la actividad..."
                                autoFocus
                                className="w-full bg-[var(--color-bg-input)] text-[var(--color-text-primary)] rounded-[var(--radius-lg)] px-[var(--space-3-5)] py-[var(--space-2-5)] border border-[var(--color-border)] focus:outline-none focus:border-[var(--color-border-focus)] focus:ring-1 focus:ring-[var(--color-accent-ring)] text-sm mb-[var(--space-3)] transition-colors duration-[var(--transition-base)] placeholder:text-[var(--color-text-placeholder)]"
                            />
                            <div className="flex gap-[var(--space-2)]">
                                <button
                                    type="submit"
                                    disabled={addingTemp}
                                    className="text-sm bg-[var(--color-accent)] text-[var(--color-zinc-950)] font-medium px-[var(--space-4)] py-[var(--space-2)] rounded-[var(--radius-lg)] hover:bg-[var(--color-accent-hover)] transition-colors duration-[var(--transition-base)] disabled:bg-[var(--color-zinc-800-60)] disabled:text-[var(--color-text-disabled-on-bg)]"
                                >
                                    Agregar
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowTempForm(false)
                                        setTempTitle('')
                                    }}
                                    className="text-sm text-[var(--color-text-disabled)] hover:text-[var(--color-text-tertiary)] px-[var(--space-4)] py-[var(--space-2)] rounded-[var(--radius-lg)] transition-colors duration-[var(--transition-base)]"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    ) : (
                        <button
                            onClick={() => setShowTempForm(true)}
                            className="w-full flex items-center justify-center gap-[var(--space-2)] border border-dashed border-[var(--color-zinc-800)] hover:border-[var(--color-border-hover)] text-[var(--color-text-disabled)] hover:text-[var(--color-text-muted)] rounded-[var(--radius-xl)] py-[var(--space-3)] text-sm transition-colors duration-[var(--transition-base)] hover:bg-[var(--color-bg-elevated)]"
                        >
                            <Plus className="w-4 h-4" strokeWidth={2} />
                            Agregar actividad solo para hoy
                        </button>
                    )}

                </div>
            </PageTransition>
        </div>
    )
}

export default Today
