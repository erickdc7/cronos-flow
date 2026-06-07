import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'motion/react'
import { Check, FileText, X, Zap } from 'lucide-react'
import { toggleEntry, updateNote, deleteTempEntry } from '../lib/api'

const ActivityItem = ({ entry, onUpdate, onDelete, index = 0 }) => {
    const [isEditingNote, setIsEditingNote] = useState(false)
    const [note, setNote] = useState(entry.note || '')
    const [loading, setLoading] = useState(false)
    const shouldReduceMotion = useReducedMotion()
    const noteRef = useRef(null)

    useEffect(() => {
        if (isEditingNote && noteRef.current) {
            const el = noteRef.current
            el.focus()
            // Mover el cursor al final del texto existente
            const length = el.value.length
            el.setSelectionRange(length, length)
        }
    }, [isEditingNote])

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

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSaveNote()
        }
    }
    
    const content = (
        <div className={`
            group rounded-xl border p-4 transition-all duration-200
            ${entry.done
                ? 'bg-emerald-950/20 border-emerald-900/40'
                : 'bg-zinc-900/60 border-zinc-800/60 hover:border-zinc-700/60'
            }
        `}>
            {/* Main row */}
            <div className="flex items-center gap-3">
                <button
                    onClick={handleToggle}
                    disabled={loading}
                    className={`
                        w-[22px] h-[22px] rounded-full border-2 flex items-center justify-center
                        transition-all duration-200 flex-shrink-0
                        ${entry.done
                            ? 'bg-emerald-500 border-emerald-500'
                            : 'border-zinc-600 hover:border-emerald-400'
                        }
                        ${loading ? 'opacity-50' : ''}
                    `}
                    aria-label={entry.done ? 'Marcar como pendiente' : 'Marcar como completado'}
                >
                    {entry.done && (
                        <Check className="w-3 h-3 text-white" strokeWidth={3} />
                    )}
                </button>

                <span className={`
                    flex-1 text-sm font-medium transition-all duration-200
                    ${entry.done ? 'line-through text-zinc-600' : 'text-zinc-200'}
                `}>
                    {entry.title}
                </span>

                {entry.is_temp && (
                    <span className="flex items-center gap-1 text-[11px] text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full font-medium">
                        <Zap className="w-3 h-3" strokeWidth={2} />
                        Solo hoy
                    </span>
                )}

                <button
                    onClick={() => setIsEditingNote(!isEditingNote)}
                    className="text-zinc-600 hover:text-zinc-300 transition-colors duration-200 p-1 rounded-md hover:bg-zinc-800/60"
                    title={entry.note ? 'Editar nota' : 'Agregar nota'}
                >
                    <FileText className="w-3.5 h-3.5" strokeWidth={1.5} />
                </button>

                {/* Delete button for temp entries */}
                {entry.is_temp && (
                    <button
                        onClick={handleDelete}
                        className="text-zinc-700 hover:text-red-400 transition-colors duration-200 p-1 rounded-md hover:bg-red-400/10"
                        title="Eliminar actividad"
                    >
                        <X className="w-3.5 h-3.5" strokeWidth={2} />
                    </button>
                )}
            </div>

            {/* Note editor */}
            <AnimatePresence>
                {isEditingNote && (
                    <motion.div
                        initial={shouldReduceMotion ? false : { opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
                        className="overflow-hidden"
                    >
                        <div className="mt-3 pl-[34px]">
                            <textarea
                                ref={noteRef}
                                onKeyDown={handleKeyDown}
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                placeholder="Escribe una anotación..."
                                rows={2}
                                className="w-full bg-zinc-800/60 text-zinc-200 text-sm rounded-lg px-3 py-2 border border-zinc-700/60 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 resize-none transition-colors duration-200 placeholder:text-zinc-600"
                            />
                            <div className="flex gap-2 mt-2">
                                <button
                                    onClick={handleSaveNote}
                                    className="text-xs bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-medium px-3 py-1.5 rounded-lg transition-colors duration-200"
                                >
                                    Guardar
                                </button>
                                <button
                                    onClick={() => {
                                        setNote(entry.note || '')
                                        setIsEditingNote(false)
                                    }}
                                    className="text-xs text-zinc-500 hover:text-zinc-300 px-3 py-1.5 rounded-lg transition-colors duration-200"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Saved note display */}
            {!isEditingNote && entry.note && (
                <p className="mt-2 pl-[34px] text-xs text-zinc-500 italic leading-relaxed">
                    {entry.note}
                </p>
            )}
        </div>
    )

    // Wrap in motion for stagger animation
    if (shouldReduceMotion) {
        return content
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
                duration: 0.35,
                delay: index * 0.04,
                ease: [0.23, 1, 0.32, 1]
            }}
        >
            {content}
        </motion.div>
    )
}

export default ActivityItem