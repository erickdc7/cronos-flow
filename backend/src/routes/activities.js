const express = require('express')
const router = express.Router()
const supabase = require('../lib/supabase')
const { matchesSchedule, isSpecificDate } = require('../lib/schedule')

// GET /api/activities — traer todas las actividades fijas (excluye las de fecha pasada)
router.get('/', async (req, res) => {
    const userId = req.user.id
    const today = new Date().toLocaleDateString('en-CA', { timeZone: req.timezone })

    try {
        const { data, error } = await supabase
            .from('activities')
            .select('*')
            .eq('user_id', userId)
            .order('title', { ascending: true })

        if (error) throw error

        // Auto-delete specific-date activities whose date has passed
        const expired = data.filter(a => isSpecificDate(a.schedule) && a.schedule < today)
        if (expired.length > 0) {
            await supabase
                .from('activities')
                .delete()
                .in('id', expired.map(a => a.id))
        }

        // Return only non-expired activities
        const active = data.filter(a => !expired.some(e => e.id === a.id))
        res.json(active)

    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Error al obtener las actividades' })
    }
})

// POST /api/activities — crear una actividad fija permanente
router.post('/', async (req, res) => {
    const userId = req.user.id
    const { title, description, schedule } = req.body

    if (!title) {
        return res.status(400).json({ error: 'El título es requerido' })
    }

    try {
        // Calcular el order_index para ponerla al final
        const { data: existing } = await supabase
            .from('activities')
            .select('order_index')
            .eq('user_id', userId)
            .order('order_index', { ascending: false })
            .limit(1)

        const nextIndex = existing && existing.length > 0
            ? existing[0].order_index + 1
            : 0

        const { data, error } = await supabase
            .from('activities')
            .insert({
                user_id: userId,
                title,
                description: description || null,
                schedule: schedule || 'daily',
                order_index: nextIndex
            })
            .select()
            .single()

        if (error) throw error

        // Sincronizar con el log del día actual si ya existe y el schedule coincide
        const today = new Date().toLocaleDateString('en-CA', { timeZone: req.timezone })

        if (matchesSchedule(data.schedule, today)) {
            const { data: todayLog } = await supabase
                .from('daily_logs')
                .select('id')
                .eq('user_id', userId)
                .eq('date', today)
                .single()

            if (todayLog) {
                const { data: existingEntry } = await supabase
                    .from('log_entries')
                    .select('id')
                    .eq('log_id', todayLog.id)
                    .eq('activity_id', data.id)
                    .single()

                if (!existingEntry) {
                    await supabase
                        .from('log_entries')
                        .insert({
                            log_id: todayLog.id,
                            activity_id: data.id,
                            title: data.title,
                            done: false,
                            is_temp: false
                        })
                }
            }
        }

        res.status(201).json(data)

    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Error al crear la actividad' })
    }
})

// PATCH /api/activities/:id — editar una actividad fija
router.patch('/:id', async (req, res) => {
    const { id } = req.params
    const { title, description, is_active, order_index, schedule } = req.body

    try {
        const updates = {}
        if (title !== undefined) updates.title = title
        if (description !== undefined) updates.description = description
        if (is_active !== undefined) updates.is_active = is_active
        if (order_index !== undefined) updates.order_index = order_index
        if (schedule !== undefined) updates.schedule = schedule

        const { data, error } = await supabase
            .from('activities')
            .update(updates)
            .eq('id', id)
            .eq('user_id', req.user.id)
            .select()
            .single()

        if (error) throw error

        // Si se actualizó el título, sincronizarlo en el log de hoy
        if (title !== undefined) {
            const today = new Date().toLocaleDateString('en-CA', { timeZone: req.timezone })
            const { data: todayLog } = await supabase
                .from('daily_logs')
                .select('id')
                .eq('user_id', req.user.id)
                .eq('date', today)
                .single()

            if (todayLog) {
                await supabase
                    .from('log_entries')
                    .update({ title })
                    .eq('log_id', todayLog.id)
                    .eq('activity_id', id)
            }
        }

        if (is_active === true) {
            const today = new Date().toLocaleDateString('en-CA', { timeZone: req.timezone })

            // Only sync to today if schedule matches
            if (matchesSchedule(data.schedule, today)) {
                const { data: todayLog } = await supabase
                    .from('daily_logs')
                    .select('id')
                    .eq('user_id', req.user.id)
                    .eq('date', today)
                    .single()

                if (todayLog) {
                    const { data: existingEntry } = await supabase
                        .from('log_entries')
                        .select('id')
                        .eq('log_id', todayLog.id)
                        .eq('activity_id', id)
                        .single()

                    if (!existingEntry) {
                        await supabase
                            .from('log_entries')
                            .insert({
                                log_id: todayLog.id,
                                activity_id: data.id,
                                title: data.title,
                                done: false,
                                is_temp: false
                            })
                    }
                }
            }
        }

        res.json(data)

    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Error al actualizar la actividad' })
    }
})

// DELETE /api/activities/:id — eliminar una actividad fija
router.delete('/:id', async (req, res) => {
    const { id } = req.params

    try {
        const { error } = await supabase
            .from('activities')
            .delete()
            .eq('id', id)
            .eq('user_id', req.user.id)

        if (error) throw error

        res.json({ message: 'Actividad eliminada correctamente' })

    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Error al eliminar la actividad' })
    }
})

// POST /api/activities/sync-today — sincroniza actividades faltantes con el log de hoy
router.post('/sync-today', async (req, res) => {
    const userId = req.user.id
    const today = new Date().toLocaleDateString('en-CA', { timeZone: req.timezone })

    try {
        // Auto-delete expired specific-date activities
        const { data: allActivities } = await supabase
            .from('activities')
            .select('id, schedule')
            .eq('user_id', userId)

        if (allActivities) {
            const expired = allActivities.filter(a =>
                isSpecificDate(a.schedule) && a.schedule < today
            )
            if (expired.length > 0) {
                await supabase
                    .from('activities')
                    .delete()
                    .in('id', expired.map(a => a.id))
            }
        }

        // Buscar el log de hoy
        const { data: todayLog } = await supabase
            .from('daily_logs')
            .select('id')
            .eq('user_id', userId)
            .eq('date', today)
            .single()

        if (!todayLog) {
            return res.json({ message: 'No hay log para hoy todavía', synced: 0 })
        }

        // Traer todas las actividades activas que aplican hoy
        const { data: activities } = await supabase
            .from('activities')
            .select('*')
            .eq('user_id', userId)
            .eq('is_active', true)

        const matchingActivities = (activities || []).filter(a =>
            matchesSchedule(a.schedule, today)
        )

        // Traer entries que ya existen hoy
        const { data: existingEntries } = await supabase
            .from('log_entries')
            .select('activity_id')
            .eq('log_id', todayLog.id)

        const existingActivityIds = existingEntries
            .map(e => e.activity_id)
            .filter(Boolean)

        // Filtrar las que faltan
        const missing = matchingActivities.filter(
            a => !existingActivityIds.includes(a.id)
        )

        if (missing.length === 0) {
            return res.json({ message: 'Todo sincronizado', synced: 0 })
        }

        // Insertar las que faltan
        const newEntries = missing.map(a => ({
            log_id: todayLog.id,
            activity_id: a.id,
            title: a.title,
            done: false,
            is_temp: false
        }))

        await supabase.from('log_entries').insert(newEntries)

        res.json({ message: `${missing.length} actividades sincronizadas`, synced: missing.length })

    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Error al sincronizar' })
    }
})

module.exports = router
