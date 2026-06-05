import { useState, useEffect } from 'react'
import { Plus, ListChecks } from 'lucide-react'
import { getToday, addTempEntry } from '../lib/api'
import ActivityItem from '../components/ActivityItem'
import ProgressRing from '../components/ProgressRing'
import PageTransition from '../components/PageTransition'
import LoadingSpinner from '../components/LoadingSpinner'
import EmptyState from '../components/EmptyState'

const Today = () => {
    const [log, setLog] = useState(null)
    const [entries, setEntries] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [showTempForm, setShowTempForm] = useState(false)
    const [tempTitle, setTempTitle] = useState('')
    const [addingTemp, setAddingTemp] = useState(false)

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

    // Stats
    const completed = entries.filter(e => e.done).length
    const total = entries.length
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0

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
            <div className="min-h-[100dvh] flex items-center justify-center bg-zinc-950">
                <LoadingSpinner message="Cargando tu día..." />
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-[100dvh] flex items-center justify-center bg-zinc-950">
                <p className="text-red-400 text-sm">{error}</p>
            </div>
        )
    }

    return (
        <div className="min-h-[100dvh] bg-zinc-950 px-4 py-6">
            <PageTransition>
                <div className="max-w-2xl mx-auto">

                    {/* Day header */}
                    <div className="mb-8">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                                <p className="text-zinc-600 text-xs font-medium uppercase tracking-wide mb-1 capitalize">{dateLabel}</p>
                                <h1 className="text-zinc-100 text-2xl font-semibold tracking-tight">Tu día</h1>

                                {/* Linear progress bar */}
                                <div className="flex items-center gap-3 mt-4">
                                    <div className="flex-1 bg-zinc-800/80 rounded-full h-1.5 overflow-hidden">
                                        <div
                                            className="bg-emerald-500 h-1.5 rounded-full transition-all duration-700 ease-out"
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                    <span className="font-mono text-xs text-zinc-500 tabular-nums whitespace-nowrap">
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
                        <div className="flex flex-col gap-2.5 mb-5">
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
                    )}

                    {/* Add temporary activity */}
                    {showTempForm ? (
                        <form onSubmit={handleAddTemp} className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl p-4">
                            <p className="text-zinc-500 text-xs mb-3 font-medium">
                                Esta actividad solo aparecerá hoy
                            </p>
                            <input
                                type="text"
                                value={tempTitle}
                                onChange={(e) => setTempTitle(e.target.value)}
                                placeholder="Nombre de la actividad..."
                                autoFocus
                                className="w-full bg-zinc-800/60 text-zinc-100 rounded-lg px-3.5 py-2.5 border border-zinc-700/60 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 text-sm mb-3 transition-colors duration-200 placeholder:text-zinc-600"
                            />
                            <div className="flex gap-2">
                                <button
                                    type="submit"
                                    disabled={addingTemp}
                                    className="text-sm bg-emerald-500 text-zinc-950 font-medium px-4 py-2 rounded-lg hover:bg-emerald-400 transition-colors duration-200 disabled:opacity-50"
                                >
                                    Agregar
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowTempForm(false)
                                        setTempTitle('')
                                    }}
                                    className="text-sm text-zinc-500 hover:text-zinc-300 px-4 py-2 rounded-lg transition-colors duration-200"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    ) : (
                        <button
                            onClick={() => setShowTempForm(true)}
                            className="w-full flex items-center justify-center gap-2 border border-dashed border-zinc-800 hover:border-zinc-600 text-zinc-600 hover:text-zinc-400 rounded-xl py-3 text-sm transition-all duration-200 hover:bg-zinc-900/40"
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