import axios from 'axios'
import { supabase } from './supabase'

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL
})

// Interceptor — agrega el token de Supabase en cada petición automáticamente
api.interceptors.request.use(async (config) => {
    const { data: { session } } = await supabase.auth.getSession()

    if (session?.access_token) {
        config.headers.Authorization = `Bearer ${session.access_token}`
    }

    // Detectar y enviar la zona horaria del usuario automáticamente
    config.headers['X-Timezone'] = Intl.DateTimeFormat().resolvedOptions().timeZone

    return config
})

// Today
export const getToday = () => api.get('/api/today')

// Entries
export const toggleEntry = (id) => api.patch(`/api/entries/${id}/toggle`)
export const updateNote = (id, note) => api.patch(`/api/entries/${id}/note`, { note })
export const addTempEntry = (log_id, title) => api.post('/api/entries', { log_id, title })

// Activities
export const getActivities = () => api.get('/api/activities')
export const createActivity = (title, description) => api.post('/api/activities', { title, description })
export const updateActivity = (id, data) => api.patch(`/api/activities/${id}`, data)
export const deleteActivity = (id) => api.delete(`/api/activities/${id}`)

// History
export const getHistory = (page = 1, limit = 7) => api.get('/api/history', { params: { page, limit } })
export const getHistoryByDate = (date) => api.get(`/api/history/${date}`)
export const syncToday = () => api.post('/api/activities/sync-today')
export const deleteTempEntry = (id) => api.delete(`/api/entries/${id}`)
