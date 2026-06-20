import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'motion/react'
import { Check, FileText, X, Zap } from 'lucide-react'
import { toggleEntry, updateNote, deleteTempEntry } from '../lib/api'
import ConfirmDialog from './ConfirmDialog'

const ActivityItem = ({ entry, onUpdate, onDelete, index = 0 }) => {
    const [isEditingNote, setIsEditingNote] = useState(false)
    const [note, setNote] = useState(entry.note || '')
    const [loading, setLoading] = useState(false)
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)
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

    const handleDeleteClick = () => {
        setShowDeleteDialog(true)
    }

    const handleDeleteConfirm = async () => {
        try {
            await deleteTempEntry(entry.id)
            onDelete(entry.id)
            setShowDeleteDialog(false)
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
            group rounded-[var(--radius-xl)] border p-[var(--space-4)] transition-colors-base
            ${entry.done
                ? 'bg-emerald-950/20 border-emerald-900/40'
                : 'bg-[var(--color-bg-surface)] border-[var(--color-border)] hover:border-[var(--color-border-hover)]'
            }
        `}>
            {/* Main row */}
            <div className="flex items-center gap-3">
                <button
                    onClick={handleToggle}
                    disabled={loading}
                    className={`
                        w-[22px] h-[22px] rounded-[var(--radius-full)] border-2 flex items-center justify-center
                        transition-colors-base flex-shrink-0
                        ${entry.done
                            ? 'bg-[var(--color-accent)] border-[var(--color-accent)]'
                            : 'border-[var(--color-text-disabled)] hover:border-[var(--color-accent-subtle)]'
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
                    flex-1 text-sm font-medium transition-colors-base
                    ${entry.done ? 'line-through text-[var(--color-text-disabled)]' : 'text-[var(--color-text-secondary)]'}
                `}>
                    {entry.title}
                </span>

                {entry.is_temp && (
                    <span className="flex items-center gap-1 text-[11px] text-[var(--color-warning-text)] bg-[var(--color-warning-bg)] px-[var(--space-2)] py-[var(--space-0-5)] rounded-[var(--radius-full)] font-medium">
                        <Zap className="w-3 h-3" strokeWidth={2} />
                        Solo hoy
                    </span>
                )}

                <button
                    onClick={() => setIsEditingNote(!isEditingNote)}
                    className="text-[var(--color-text-disabled)] hover:text-[var(--color-text-tertiary)] transition-colors-base p-1 rounded-[var(--radius-md)] hover:bg-[var(--color-bg-surface)]"
                    title={entry.note ? 'Editar nota' : 'Agregar nota'}
                >
                    <FileText className="w-3.5 h-3.5" strokeWidth={1.5} />
                </button>

                {/* Delete button for temp entries */}
                {entry.is_temp && (
                    <button
                        onClick={handleDeleteClick}
                        className="text-[var(--color-text-disabled)] hover:text-[var(--color-error)] transition-colors-base p-1 rounded-[var(--radius-md)] hover:bg-[var(--color-error-bg)]"
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
                        <div className="mt-[var(--space-3)] pl-[34px]">
                            <textarea
                                ref={noteRef}
                                onKeyDown={handleKeyDown}
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                placeholder="Escribe una anotación..."
                                rows={2}
                                className="w-full bg-[var(--color-bg-input)] text-[var(--color-text-secondary)] text-sm rounded-[var(--radius-lg)] px-[var(--space-3)] py-[var(--space-2)] border border-[var(--color-border)] focus:outline-none focus:border-[var(--color-border-focus)] focus:ring-1 focus:ring-[var(--color-accent-ring)] resize-none transition-colors-base placeholder:text-[var(--color-text-placeholder)]"
                            />
                            <div className="flex gap-[var(--space-2)] mt-[var(--space-2)]">
                                <button
                                    onClick={handleSaveNote}
                                    className="text-xs bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-[var(--color-zinc-950)] font-medium px-[var(--space-3)] py-[var(--space-1-5)] rounded-[var(--radius-lg)] transition-colors-base"
                                >
                                    Guardar
                                </button>
                                <button
                                    onClick={() => {
                                        setNote(entry.note || '')
                                        setIsEditingNote(false)
                                    }}
                                    className="text-xs text-[var(--color-text-disabled)] hover:text-[var(--color-text-tertiary)] px-[var(--space-3)] py-[var(--space-1-5)] rounded-[var(--radius-lg)] transition-colors-base"
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
                <p className="mt-[var(--space-2)] pl-[34px] text-xs text-[var(--color-text-disabled)] italic leading-relaxed">
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
            layout="position"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
                duration: 0.35,
                layout: {
                    duration: 0.45,
                    ease: [0.23, 1, 0.32, 1]
                },
                delay: index * 0.04,
                ease: [0.23, 1, 0.32, 1]
            }}
        >
            {content}
            <ConfirmDialog
                isOpen={showDeleteDialog}
                onClose={() => setShowDeleteDialog(false)}
                onConfirm={handleDeleteConfirm}
                title="¿Eliminar esta actividad?"
                message="Esta acción no se puede deshacer."
                confirmText="Eliminar"
                cancelText="Cancelar"
            />
        </motion.div>
    )
}

export default ActivityItem
