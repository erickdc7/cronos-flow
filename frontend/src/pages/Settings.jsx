import { useState, useEffect } from 'react'
import { getActivities, createActivity, updateActivity, deleteActivity } from '../lib/api'

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



    const fetchActivities = async () => {
        try {
            const { data } = await getActivities()
            setActivities(data)
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
            <div className="min-h-screen bg-gray-950 flex items-center justify-center">
                <p className="text-gray-400">Cargando actividades...</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-950 px-4 py-8">
            <div className="max-w-2xl mx-auto">

                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-white text-2xl font-bold">Actividades</h1>
                        <p className="text-gray-500 text-sm mt-1">
                            Estas actividades aparecerán todos los días
                        </p>
                    </div>
                    <button
                        onClick={() => setShowForm(true)}
                        className="bg-white text-gray-950 text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        + Nueva
                    </button>
                </div>

                {/* Formulario nueva actividad */}
                {showForm && (
                    <form
                        onSubmit={handleCreate}
                        className="bg-gray-900 border border-gray-700 rounded-xl p-5 mb-6"
                    >
                        <h2 className="text-white font-medium mb-4">Nueva actividad permanente</h2>
                        <div className="flex flex-col gap-3">
                            <input
                                type="text"
                                value={newTitle}
                                onChange={(e) => setNewTitle(e.target.value)}
                                placeholder="Nombre de la actividad *"
                                autoFocus
                                className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 border border-gray-700 focus:outline-none focus:border-gray-500 text-sm"
                            />
                            <input
                                type="text"
                                value={newDescription}
                                onChange={(e) => setNewDescription(e.target.value)}
                                placeholder="Descripción (opcional)"
                                className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 border border-gray-700 focus:outline-none focus:border-gray-500 text-sm"
                            />
                            <div className="flex gap-2">
                                <button
                                    type="submit"
                                    disabled={adding}
                                    className="text-sm bg-white text-gray-950 font-medium px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
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
                                    className="text-sm text-gray-400 hover:text-white px-4 py-2 rounded-lg transition-colors"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    </form>
                )}

                {/* Lista de actividades */}
                {activities.length === 0 ? (
                    <div className="text-center py-16">
                        <p className="text-gray-500 mb-2">No tienes actividades configuradas</p>
                        <p className="text-gray-600 text-sm">Agrega tus rutinas diarias con el botón "Nueva"</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {activities.map(activity => (
                            <div
                                key={activity.id}
                                className={`bg-gray-900 border rounded-xl p-4 ${activity.is_active ? 'border-gray-800' : 'border-gray-800 opacity-50'
                                    }`}
                            >
                                {/* Modo edición */}
                                {editingId === activity.id ? (
                                    <div className="flex flex-col gap-3">
                                        <input
                                            type="text"
                                            value={editTitle}
                                            onChange={(e) => setEditTitle(e.target.value)}
                                            autoFocus
                                            className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 border border-gray-600 focus:outline-none focus:border-gray-500 text-sm"
                                        />
                                        <input
                                            type="text"
                                            value={editDescription}
                                            onChange={(e) => setEditDescription(e.target.value)}
                                            placeholder="Descripción (opcional)"
                                            className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 border border-gray-700 focus:outline-none focus:border-gray-500 text-sm"
                                        />
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleSaveEdit(activity.id)}
                                                className="text-xs bg-white text-gray-950 font-medium px-3 py-1.5 rounded-lg hover:bg-gray-200 transition-colors"
                                            >
                                                Guardar
                                            </button>
                                            <button
                                                onClick={() => setEditingId(null)}
                                                className="text-xs text-gray-400 hover:text-white px-3 py-1.5 rounded-lg transition-colors"
                                            >
                                                Cancelar
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    /* Modo vista */
                                    <div className="flex items-center gap-3">
                                        <div className="flex-1">
                                            <p className="text-white text-sm font-medium">{activity.title}</p>
                                            {activity.description && (
                                                <p className="text-gray-500 text-xs mt-0.5">{activity.description}</p>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleStartEdit(activity)}
                                                className="text-xs text-gray-400 hover:text-white px-2 py-1 rounded-lg transition-colors"
                                            >
                                                Editar
                                            </button>
                                            <button
                                                onClick={() => handleToggleActive(activity)}
                                                className={`text-xs px-3 py-1 rounded-full transition-colors ${activity.is_active
                                                    ? 'bg-green-500/10 text-green-400 hover:bg-red-500/10 hover:text-red-400'
                                                    : 'bg-gray-800 text-gray-500 hover:bg-green-500/10 hover:text-green-400'
                                                    }`}
                                            >
                                                {activity.is_active ? 'Activa' : 'Inactiva'}
                                            </button>
                                            <button
                                                onClick={() => handleDelete(activity.id)}
                                                className="text-gray-600 hover:text-red-400 transition-colors text-xs px-2 py-1"
                                            >
                                                Eliminar
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

            </div>
        </div>
    )
}

export default Settings