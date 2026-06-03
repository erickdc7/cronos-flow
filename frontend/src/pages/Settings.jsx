import { useState, useEffect } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, Sparkles } from 'lucide-react'
import { getActivities, createActivity, updateActivity, deleteActivity, syncToday } from '../lib/api'
import PageTransition from '../components/PageTransition'
import LoadingSpinner from '../components/LoadingSpinner'
import EmptyState from '../components/EmptyState'

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

    const handleDelete = async (id) => {
        if (!confirm('¿Estás seguro de eliminar esta actividad?')) return
        try {
            await deleteActivity(id)
            setActivities(prev => prev.filter(a => a.id !== id))
        } catch (err) {
            console.error('Error al eliminar:', err)
        }
    }

    if (loading) {
        return (
            <div className="min-h-[100dvh] flex items-center justify-center bg-zinc-950">
                <LoadingSpinner message="Cargando actividades..." />
            </div>
        )
    }

    return (
        <div className="min-h-[100dvh] bg-zinc-950 px-4 py-6">
            <PageTransition>
                <div className="max-w-2xl mx-auto">

                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-zinc-100 text-2xl font-semibold tracking-tight">Actividades</h1>
                            <p className="text-zinc-600 text-xs mt-1">
                                Estas actividades aparecerán todos los días
                            </p>
                        </div>
                        <button
                            onClick={() => setShowForm(true)}
                            className="flex items-center gap-1.5 bg-emerald-500 text-zinc-950 text-sm font-medium px-3.5 py-2 rounded-lg hover:bg-emerald-400 transition-colors duration-200"
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
                            className="bg-zinc-900/60 border border-zinc-700/50 rounded-xl p-5 mb-5"
                        >
                            <h2 className="text-zinc-200 font-medium text-sm mb-4">Nueva actividad permanente</h2>
                            <div className="flex flex-col gap-3">
                                <div>
                                    <label className="text-zinc-400 text-xs font-medium mb-1.5 block">Nombre *</label>
                                    <input
                                        type="text"
                                        value={newTitle}
                                        onChange={(e) => setNewTitle(e.target.value)}
                                        placeholder="Nombre de la actividad"
                                        autoFocus
                                        className="w-full bg-zinc-800/60 text-zinc-100 rounded-lg px-3.5 py-2.5 border border-zinc-700/60 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 text-sm transition-colors duration-200 placeholder:text-zinc-600"
                                    />
                                </div>
                                <div>
                                    <label className="text-zinc-400 text-xs font-medium mb-1.5 block">Descripción</label>
                                    <input
                                        type="text"
                                        value={newDescription}
                                        onChange={(e) => setNewDescription(e.target.value)}
                                        placeholder="Descripción opcional"
                                        className="w-full bg-zinc-800/60 text-zinc-100 rounded-lg px-3.5 py-2.5 border border-zinc-700/60 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 text-sm transition-colors duration-200 placeholder:text-zinc-600"
                                    />
                                </div>
                                <div className="flex gap-2 pt-1">
                                    <button
                                        type="submit"
                                        disabled={adding}
                                        className="text-sm bg-emerald-500 text-zinc-950 font-medium px-4 py-2 rounded-lg hover:bg-emerald-400 transition-colors duration-200 disabled:opacity-50"
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
                                        className="text-sm text-zinc-500 hover:text-zinc-300 px-4 py-2 rounded-lg transition-colors duration-200"
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
                        <div className="flex flex-col gap-2.5">
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
                                        bg-zinc-900/40 border border-zinc-800/50 rounded-xl p-4 transition-opacity duration-200
                                        ${!activity.is_active ? 'opacity-45' : ''}
                                    `}
                                >
                                    {/* Edit mode */}
                                    {editingId === activity.id ? (
                                        <div className="flex flex-col gap-3">
                                            <input
                                                type="text"
                                                value={editTitle}
                                                onChange={(e) => setEditTitle(e.target.value)}
                                                autoFocus
                                                className="w-full bg-zinc-800/60 text-zinc-100 rounded-lg px-3.5 py-2.5 border border-zinc-700/60 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 text-sm transition-colors duration-200"
                                            />
                                            <input
                                                type="text"
                                                value={editDescription}
                                                onChange={(e) => setEditDescription(e.target.value)}
                                                placeholder="Descripción opcional"
                                                className="w-full bg-zinc-800/60 text-zinc-100 rounded-lg px-3.5 py-2.5 border border-zinc-700/60 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 text-sm transition-colors duration-200 placeholder:text-zinc-600"
                                            />
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleSaveEdit(activity.id)}
                                                    className="text-xs bg-emerald-500 text-zinc-950 font-medium px-3 py-1.5 rounded-lg hover:bg-emerald-400 transition-colors duration-200"
                                                >
                                                    Guardar
                                                </button>
                                                <button
                                                    onClick={() => setEditingId(null)}
                                                    className="text-xs text-zinc-500 hover:text-zinc-300 px-3 py-1.5 rounded-lg transition-colors duration-200"
                                                >
                                                    Cancelar
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        /* View mode */
                                        <div className="flex items-center gap-3">
                                            <div className="flex-1 min-w-0">
                                                <p className="text-zinc-200 text-sm font-medium truncate">{activity.title}</p>
                                                {activity.description && (
                                                    <p className="text-zinc-600 text-xs mt-0.5 truncate">{activity.description}</p>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-1.5 flex-shrink-0">
                                                <button
                                                    onClick={() => handleStartEdit(activity)}
                                                    className="p-1.5 text-zinc-600 hover:text-zinc-300 rounded-md hover:bg-zinc-800/60 transition-colors duration-200"
                                                    title="Editar"
                                                >
                                                    <Pencil className="w-3.5 h-3.5" strokeWidth={1.5} />
                                                </button>
                                                <button
                                                    onClick={() => handleToggleActive(activity)}
                                                    className={`p-1.5 rounded-md transition-colors duration-200 ${activity.is_active
                                                        ? 'text-emerald-400 hover:bg-emerald-400/10'
                                                        : 'text-zinc-600 hover:bg-zinc-800/60 hover:text-zinc-400'
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
                                                    onClick={() => handleDelete(activity.id)}
                                                    className="p-1.5 text-zinc-700 hover:text-red-400 rounded-md hover:bg-red-400/10 transition-colors duration-200"
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

                </div>
            </PageTransition>
        </div>
    )
}

export default Settings