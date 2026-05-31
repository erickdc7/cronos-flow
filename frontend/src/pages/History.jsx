import { useState, useEffect } from 'react'
import { getHistory, getHistoryByDate } from '../lib/api'

const History = () => {
    const [logs, setLogs] = useState([])
    const [selectedLog, setSelectedLog] = useState(null)
    const [selectedEntries, setSelectedEntries] = useState([])
    const [loading, setLoading] = useState(true)
    const [loadingDetail, setLoadingDetail] = useState(false)

    useEffect(() => {
        fetchHistory()
    }, [])

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

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-950 flex items-center justify-center">
                <p className="text-gray-400">Cargando historial...</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-950 px-4 py-8">
            <div className="max-w-4xl mx-auto">

                <h1 className="text-white text-2xl font-bold mb-8">Historial</h1>

                {logs.length === 0 ? (
                    <p className="text-gray-500 text-center py-16">
                        Aún no hay días registrados
                    </p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        {/* Lista de días */}
                        <div className="flex flex-col gap-3">
                            {logs.map(log => (
                                <button
                                    key={log.id}
                                    onClick={() => handleSelectDay(log.date)}
                                    className={`text-left bg-gray-900 border rounded-xl p-4 transition-all hover:border-gray-600 ${selectedLog?.date === log.date
                                            ? 'border-white'
                                            : 'border-gray-800'
                                        }`}
                                >
                                    <p className="text-white text-sm font-medium capitalize mb-2">
                                        {formatDate(log.date)}
                                    </p>

                                    {/* Barra de progreso */}
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 bg-gray-800 rounded-full h-1.5">
                                            <div
                                                className="bg-green-500 h-1.5 rounded-full"
                                                style={{
                                                    width: log.total > 0
                                                        ? `${Math.round((log.completed / log.total) * 100)}%`
                                                        : '0%'
                                                }}
                                            />
                                        </div>
                                        <span className="text-gray-500 text-xs">
                                            {log.completed}/{log.total}
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>

                        {/* Detalle del día seleccionado */}
                        <div>
                            {loadingDetail ? (
                                <p className="text-gray-400 text-sm">Cargando...</p>
                            ) : selectedLog ? (
                                <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                                    <h2 className="text-white font-semibold mb-4 capitalize">
                                        {formatDate(selectedLog.date)}
                                    </h2>
                                    <div className="flex flex-col gap-3">
                                        {selectedEntries.map(entry => (
                                            <div
                                                key={entry.id}
                                                className={`flex items-start gap-3 p-3 rounded-lg ${entry.done
                                                        ? 'bg-green-950/30'
                                                        : 'bg-gray-800/50'
                                                    }`}
                                            >
                                                <span className="mt-0.5 flex-shrink-0">
                                                    {entry.done ? '✅' : '⬜'}
                                                </span>
                                                <div>
                                                    <p className={`text-sm font-medium ${entry.done ? 'text-gray-400 line-through' : 'text-gray-100'
                                                        }`}>
                                                        {entry.title}
                                                    </p>
                                                    {entry.note && (
                                                        <p className="text-xs text-gray-500 mt-1 italic">
                                                            {entry.note}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 flex items-center justify-center h-40">
                                    <p className="text-gray-600 text-sm">
                                        Selecciona un día para ver el detalle
                                    </p>
                                </div>
                            )}
                        </div>

                    </div>
                )}
            </div>
        </div>
    )
}

export default History