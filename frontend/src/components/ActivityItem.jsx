import { useState } from 'react'
import { toggleEntry, updateNote, deleteTempEntry } from '../lib/api'

const ActivityItem = ({ entry, onUpdate, onDelete }) => {
    const [isEditingNote, setIsEditingNote] = useState(false)
    const [note, setNote] = useState(entry.note || '')
    const [loading, setLoading] = useState(false)

    const handleToggle = async () => {
        setLoading(true)
        try {
            const { data } = await toggleEntry(entry.id)
            onUpdate(data)
        } catch (error) {
            console.error('Error al togglear:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSaveNote = async () => {
        try {
            const { data } = await updateNote(entry.id, note)
            onUpdate(data)
            setIsEditingNote(false)
        } catch (error) {
            console.error('Error al guardar nota:', error)
        }
    }

    const handleDelete = async () => {
        if (!confirm('¿Eliminar esta actividad?')) return
        try {
            await deleteTempEntry(entry.id)
            onDelete(entry.id)
        } catch (error) {
            console.error('Error al eliminar:', error)
        }
    }

    return (
        <div className={`bg-gray-900 border rounded-xl p-4 transition-all ${entry.done
            ? 'border-green-800 bg-green-950/20'
            : 'border-gray-800'
            }`}>

            {/* Fila principal */}
            <div className="flex items-center gap-3">
                <button
                    onClick={handleToggle}
                    disabled={loading}
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 ${entry.done
                        ? 'bg-green-500 border-green-500'
                        : 'border-gray-600 hover:border-green-500'
                        }`}
                >
                    {entry.done && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                    )}
                </button>

                <span className={`flex-1 text-sm font-medium transition-all ${entry.done
                    ? 'line-through text-gray-500'
                    : 'text-gray-100'
                    }`}>
                    {entry.title}
                </span>

                {entry.is_temp && (
                    <span className="text-xs text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded-full">
                        Solo hoy
                    </span>
                )}

                <button
                    onClick={() => setIsEditingNote(!isEditingNote)}
                    className="text-gray-600 hover:text-gray-300 transition-colors text-xs"
                >
                    {entry.note ? '📝' : '+ nota'}
                </button>

                {/* Botón eliminar solo para temporales */}
                {entry.is_temp && (
                    <button
                        onClick={handleDelete}
                        className="text-gray-600 hover:text-red-400 transition-colors text-xs"
                    >
                        ✕
                    </button>
                )}
            </div>

            {/* Nota */}
            {isEditingNote && (
                <div className="mt-3 pl-9">
                    <textarea
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="Escribe una anotación..."
                        rows={2}
                        className="w-full bg-gray-800 text-gray-200 text-sm rounded-lg px-3 py-2 border border-gray-700 focus:outline-none focus:border-gray-500 resize-none"
                    />
                    <div className="flex gap-2 mt-2">
                        <button
                            onClick={handleSaveNote}
                            className="text-xs bg-green-600 hover:bg-green-500 text-white px-3 py-1 rounded-lg transition-colors"
                        >
                            Guardar
                        </button>
                        <button
                            onClick={() => {
                                setNote(entry.note || '')
                                setIsEditingNote(false)
                            }}
                            className="text-xs text-gray-400 hover:text-white px-3 py-1 rounded-lg transition-colors"
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            )}

            {/* Mostrar nota guardada */}
            {!isEditingNote && entry.note && (
                <p className="mt-2 pl-9 text-xs text-gray-400 italic">
                    {entry.note}
                </p>
            )}

        </div>
    )
}

export default ActivityItem