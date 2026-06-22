import { useState, useEffect } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, Sparkles } from 'lucide-react'
import { getActivities, createActivity, updateActivity, deleteActivity, syncToday } from '../lib/api'
import PageTransition from '../components/PageTransition'
import LoadingSpinner from '../components/LoadingSpinner'
import EmptyState from '../components/EmptyState'
import ConfirmDialog from '../components/ConfirmDialog'

const Settings = () => {
    const [activities, setActivities] = useState([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [newTitle, setNewTitle] = useState('')
    const [newDescription, setNewDescription] = useState('')
    const [adding, setAdding] = useState(false)
    const [editingId, setEditingId] = useState(null)
    const [editTitle, setEditTitle] = useState('')
    const [editDescription, setEditDescription] = useState('')
    const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, id: null })
    const shouldReduceMotion = useReducedMotion()

    const fetchActivities = async () => {
        try {
            const { data } = await getActivities()
            setActivities(data)
            await syncToday()
        } catch (err) {
            console.error('Error al cargar actividades:', err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchActivities()
        // eslint-disable-next-line react-hooks/set-state-in-effect
    }, [])

    const handleCreate = async (e) => {
        e.preventDefault()
        if (!newTitle.trim()) return
        setAdding(true)
        try {
            const { data } = await createActivity(newTitle.trim(), newDescription.trim())
            setActivities(prev => [...prev, data])
            setNewTitle('')
            setNewDescription('')
            setShowForm(false)
        } catch (err) {
            console.error('Error al crear actividad:', err)
        } finally {
            setAdding(false)
        }
    }

    const handleStartEdit = (activity) => {
        setEditingId(activity.id)
        setEditTitle(activity.title)
        setEditDescription(activity.description || '')
    }

    const handleSaveEdit = async (id) => {
        if (!editTitle.trim()) return
        try {
            const { data } = await updateActivity(id, {
                title: editTitle.trim(),
                description: editDescription.trim() || null
            })
            setActivities(prev => prev.map(a => a.id === data.id ? data : a))
            setEditingId(null)
        } catch (err) {
            console.error('Error al editar actividad:', err)
        }
    }

    const handleToggleActive = async (activity) => {
        try {
            const { data } = await updateActivity(activity.id, {
                is_active: !activity.is_active
            })
            setActivities(prev => prev.map(a => a.id === data.id ? data : a))
        } catch (err) {
            console.error('Error al actualizar:', err)
        }
    }

    const handleDeleteClick = (id) => {
        setDeleteDialog({ isOpen: true, id })
    }

    const handleDeleteConfirm = async () => {
        try {
            await deleteActivity(deleteDialog.id)
            setActivities(prev => prev.filter(a => a.id !== deleteDialog.id))
            setDeleteDialog({ isOpen: false, id: null })
        } catch (err) {
            console.error('Error al eliminar:', err)
        }
    }

    if (loading) {
        return (
            <div className="min-h-[100dvh] flex items-center justify-center bg-[var(--color-bg)]">
                <LoadingSpinner message="Cargando actividades..." />
            </div>
        )
    }

    return (
        <div className="min-h-[100dvh] bg-[var(--color-bg)] px-[var(--space-4)] py-[var(--space-6)]">
            <PageTransition>
                <div className="max-w-2xl mx-auto">

                    <div className="flex items-center justify-between mb-[var(--space-6)]">
                        <div>
                            <h1 className="text-[var(--color-text-primary)] text-2xl font-semibold tracking-tight">Actividades</h1>
                            <p className="text-[var(--color-text-disabled)] text-xs mt-[var(--space-1)]">
                                Estas actividades aparecerán todos los días
                            </p>
                        </div>
                        <button
                            onClick={() => setShowForm(true)}
                            className="flex items-center gap-[var(--space-1-5)] bg-[var(--color-accent)] text-[var(--color-zinc-950)] text-sm font-medium px-[var(--space-3-5)] py-[var(--space-2)] rounded-[var(--radius-lg)] hover:bg-[var(--color-accent-hover)] transition-colors-base"
                        >
                            <Plus className="w-4 h-4" strokeWidth={2.5} />
                            Nueva
                        </button>
                    </div>

                    {/* New activity form */}
                    {showForm && (
                        <motion.form
                            onSubmit={handleCreate}
                            initial={shouldReduceMotion ? false : { opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
                            className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-[var(--radius-xl)] p-[var(--space-5)] mb-[var(--space-5)]"
                        >
                            <h2 className="text-[var(--color-text-secondary)] font-medium text-sm mb-[var(--space-4)]">Nueva actividad permanente</h2>
                            <div className="flex flex-col gap-[var(--space-3)]">
                                <div>
                                    <label className="text-[var(--color-text-muted)] text-xs font-medium mb-[var(--space-1-5)] block">Nombre *</label>
                                    <input
                                        type="text"
                                        value={newTitle}
                                        onChange={(e) => setNewTitle(e.target.value)}
                                        placeholder="Nombre de la actividad"
                                        autoFocus
                                        maxLength={50}
                                        className="w-full bg-[var(--color-bg-input)] text-[var(--color-text-primary)] rounded-[var(--radius-lg)] px-[var(--space-3-5)] py-[var(--space-2-5)] border border-[var(--color-border)] focus:outline-none focus:border-[var(--color-border-focus)] focus:ring-1 focus:ring-[var(--color-accent-ring)] text-sm transition-colors-base placeholder:text-[var(--color-text-placeholder)]"
                                    />
                                </div>
                                <div>
                                    <label className="text-[var(--color-text-muted)] text-xs font-medium mb-[var(--space-1-5)] block">Descripción</label>
                                    <input
                                        type="text"
                                        value={newDescription}
                                        onChange={(e) => setNewDescription(e.target.value)}
                                        placeholder="Descripción opcional"
                                        maxLength={150}
                                        className="w-full bg-[var(--color-bg-input)] text-[var(--color-text-primary)] rounded-[var(--radius-lg)] px-[var(--space-3-5)] py-[var(--space-2-5)] border border-[var(--color-border)] focus:outline-none focus:border-[var(--color-border-focus)] focus:ring-1 focus:ring-[var(--color-accent-ring)] text-sm transition-colors-base placeholder:text-[var(--color-text-placeholder)]"
                                    />
                                </div>
                                <div className="flex gap-[var(--space-2)] pt-[var(--space-1)]">
                                    <button
                                        type="submit"
                                        disabled={adding}
                                        className="text-sm bg-[var(--color-accent)] text-[var(--color-zinc-950)] font-medium px-[var(--space-4)] py-[var(--space-2)] rounded-[var(--radius-lg)] hover:bg-[var(--color-accent-hover)] transition-colors-base disabled:bg-[var(--color-zinc-800-60)] disabled:text-[var(--color-text-disabled-on-bg)]"
                                    >
                                        {adding ? 'Guardando...' : 'Guardar'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowForm(false)
                                            setNewTitle('')
                                            setNewDescription('')
                                        }}
                                        className="text-sm text-[var(--color-text-disabled)] hover:text-[var(--color-text-tertiary)] px-[var(--space-4)] py-[var(--space-2)] rounded-[var(--radius-lg)] transition-colors-base"
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </div>
                        </motion.form>
                    )}

                    {/* Activity list */}
                    {activities.length === 0 ? (
                        <EmptyState
                            icon={Sparkles}
                            title="No tienes actividades configuradas"
                            description='Agrega tus rutinas diarias con el botón "Nueva"'
                        />
                    ) : (
                        <div className="flex flex-col gap-[var(--space-2-5)]">
                            {activities.map((activity, index) => (
                                <motion.div
                                    key={activity.id}
                                    initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{
                                        duration: 0.3,
                                        delay: index * 0.04,
                                        ease: [0.23, 1, 0.32, 1]
                                    }}
                                    className={`
                                        bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-[var(--radius-xl)] p-[var(--space-4)] transition-opacity-base
                                        ${!activity.is_active ? 'opacity-45' : ''}
                                    `}
                                >
                                    {/* Edit mode */}
                                    {editingId === activity.id ? (
                                        <div className="flex flex-col gap-[var(--space-3)]">
                                            <input
                                                type="text"
                                                value={editTitle}
                                                onChange={(e) => setEditTitle(e.target.value)}
                                                autoFocus
                                                maxLength={50}
                                                className="w-full bg-[var(--color-bg-input)] text-[var(--color-text-primary)] rounded-[var(--radius-lg)] px-[var(--space-3-5)] py-[var(--space-2-5)] border border-[var(--color-border)] focus:outline-none focus:border-[var(--color-border-focus)] focus:ring-1 focus:ring-[var(--color-accent-ring)] text-sm transition-colors-base"
                                            />
                                            <input
                                                type="text"
                                                value={editDescription}
                                                onChange={(e) => setEditDescription(e.target.value)}
                                                placeholder="Descripción opcional"
                                                maxLength={150}
                                                className="w-full bg-[var(--color-bg-input)] text-[var(--color-text-primary)] rounded-[var(--radius-lg)] px-[var(--space-3-5)] py-[var(--space-2-5)] border border-[var(--color-border)] focus:outline-none focus:border-[var(--color-border-focus)] focus:ring-1 focus:ring-[var(--color-accent-ring)] text-sm transition-colors-base placeholder:text-[var(--color-text-placeholder)]"
                                            />
                                            <div className="flex gap-[var(--space-2)]">
                                                <button
                                                    onClick={() => handleSaveEdit(activity.id)}
                                                    className="text-xs bg-[var(--color-accent)] text-[var(--color-zinc-950)] font-medium px-[var(--space-3)] py-[var(--space-1-5)] rounded-[var(--radius-lg)] hover:bg-[var(--color-accent-hover)] transition-colors-base"
                                                >
                                                    Guardar
                                                </button>
                                                <button
                                                    onClick={() => setEditingId(null)}
                                                    className="text-xs text-[var(--color-text-disabled)] hover:text-[var(--color-text-tertiary)] px-[var(--space-3)] py-[var(--space-1-5)] rounded-[var(--radius-lg)] transition-colors-base"
                                                >
                                                    Cancelar
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        /* View mode */
                                        <div className="flex items-center gap-[var(--space-3)]">
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[var(--color-text-secondary)] text-sm font-medium truncate">{activity.title}</p>
                                                {activity.description && (
                                                    <p className="text-[var(--color-text-disabled)] text-xs mt-[var(--space-0-5)] truncate">{activity.description}</p>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-[var(--space-1-5)] flex-shrink-0">
                                                <button
                                                    onClick={() => handleStartEdit(activity)}
                                                    className="p-[var(--space-1-5)] text-[var(--color-text-disabled)] hover:text-[var(--color-text-tertiary)] rounded-md hover:bg-[var(--color-bg-surface)] transition-colors-base"
                                                    title="Editar"
                                                >
                                                    <Pencil className="w-3.5 h-3.5" strokeWidth={1.5} />
                                                </button>
                                                <button
                                                    onClick={() => handleToggleActive(activity)}
                                                    className={`p-[var(--space-1-5)] rounded-md transition-colors-base ${activity.is_active
                                                        ? 'text-[var(--color-accent-subtle)] hover:bg-[var(--color-accent-bg)]'
                                                        : 'text-[var(--color-text-disabled)] hover:bg-[var(--color-bg-surface)] hover:text-[var(--color-text-muted)]'
                                                    }`}
                                                    title={activity.is_active ? 'Desactivar' : 'Activar'}
                                                >
                                                    {activity.is_active ? (
                                                        <ToggleRight className="w-5 h-5" strokeWidth={1.5} />
                                                    ) : (
                                                        <ToggleLeft className="w-5 h-5" strokeWidth={1.5} />
                                                    )}
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClick(activity.id)}
                                                    className="p-[var(--space-1-5)] text-[var(--color-zinc-700)] hover:text-[var(--color-error)] rounded-md hover:bg-[var(--color-error-bg)] transition-colors-base"
                                                    title="Eliminar"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    )}

                    <ConfirmDialog
                        isOpen={deleteDialog.isOpen}
                        onClose={() => setDeleteDialog({ isOpen: false, id: null })}
                        onConfirm={handleDeleteConfirm}
                        title="¿Estás seguro de eliminar esta actividad?"
                        message="Esta acción no se puede deshacer."
                        confirmText="Eliminar"
                        cancelText="Cancelar"
                    />

                </div>
            </PageTransition>
        </div>
    )
}

export default Settings