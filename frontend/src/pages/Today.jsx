import { useState, useEffect } from 'react'
import { getToday, addTempEntry } from '../lib/api'
import ActivityItem from '../components/ActivityItem'

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
            setEntries(data.entries)
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
        setEntries(prev =>
            prev.map(e => e.id === updatedEntry.id ? updatedEntry : e)
        )
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

    // Estadísticas del día
    const completed = entries.filter(e => e.done).length
    const total = entries.length
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0

    // Fecha formateada
    const today = new Date()
    const dateLabel = today.toLocaleDateString('es-PE', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-950 flex items-center justify-center">
                <p className="text-gray-400">Cargando tu día...</p>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-950 flex items-center justify-center">
                <p className="text-red-400">{error}</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-950 px-4 py-8">
            <div className="max-w-2xl mx-auto">

                {/* Header del día */}
                <div className="mb-8">
                    <p className="text-gray-500 text-sm capitalize mb-1">{dateLabel}</p>
                    <h1 className="text-white text-2xl font-bold mb-4">Tu día</h1>

                    {/* Barra de progreso */}
                    <div className="flex items-center gap-3">
                        <div className="flex-1 bg-gray-800 rounded-full h-2">
                            <div
                                className="bg-green-500 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${percentage}%` }}
                            />
                        </div>
                        <span className="text-gray-400 text-sm w-20 text-right">
                            {completed}/{total} — {percentage}%
                        </span>
                    </div>
                </div>

                {/* Lista de actividades */}
                {entries.length === 0 ? (
                    <div className="text-center py-16">
                        <p className="text-gray-500 mb-2">No tienes actividades para hoy</p>
                        <p className="text-gray-600 text-sm">Ve a "Actividades" para agregar tus rutinas diarias</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3 mb-6">
                        {entries.map(entry => (
                            <ActivityItem
                                key={entry.id}
                                entry={entry}
                                onUpdate={handleUpdate}
                            />
                        ))}
                    </div>
                )}

                {/* Agregar actividad temporal */}
                {showTempForm ? (
                    <form onSubmit={handleAddTemp} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                        <p className="text-gray-400 text-sm mb-3">
                            Esta actividad solo aparecerá hoy
                        </p>
                        <input
                            type="text"
                            value={tempTitle}
                            onChange={(e) => setTempTitle(e.target.value)}
                            placeholder="Nombre de la actividad..."
                            autoFocus
                            className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 border border-gray-700 focus:outline-none focus:border-gray-500 text-sm mb-3"
                        />
                        <div className="flex gap-2">
                            <button
                                type="submit"
                                disabled={addingTemp}
                                className="text-sm bg-white text-gray-950 font-medium px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                            >
                                Agregar
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowTempForm(false)
                                    setTempTitle('')
                                }}
                                className="text-sm text-gray-400 hover:text-white px-4 py-2 rounded-lg transition-colors"
                            >
                                Cancelar
                            </button>
                        </div>
                    </form>
                ) : (
                    <button
                        onClick={() => setShowTempForm(true)}
                        className="w-full border border-dashed border-gray-700 hover:border-gray-500 text-gray-500 hover:text-gray-300 rounded-xl py-3 text-sm transition-colors"
                    >
                        + Agregar actividad solo para hoy
                    </button>
                )}

            </div>
        </div>
    )
}

export default Today