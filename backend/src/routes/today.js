const express = require('express')
const router = express.Router()
const supabase = require('../lib/supabase')

// GET /api/today — trae o crea el log del día actual
router.get('/', async (req, res) => {
    const userId = req.user.id
    const today = new Date().toISOString().split('T')[0] // "2026-05-31"

    try {
        // 1. Buscar si ya existe un log para hoy
        let { data: log, error: logError } = await supabase
            .from('daily_logs')
            .select('*')
            .eq('user_id', userId)
            .eq('date', today)
            .single()

        // 2. Si no existe, crearlo
        if (!log) {
            const { data: newLog, error: createError } = await supabase
                .from('daily_logs')
                .insert({ user_id: userId, date: today })
                .select()
                .single()

            if (createError) throw createError
            log = newLog

            // 3. Copiar todas las actividades activas como entries del día
            const { data: activities, error: activitiesError } = await supabase
                .from('activities')
                .select('*')
                .eq('user_id', userId)
                .eq('is_active', true)
                .order('order_index')

            if (activitiesError) throw activitiesError

            if (activities && activities.length > 0) {
                const entries = activities.map(activity => ({
                    log_id: log.id,
                    activity_id: activity.id,
                    title: activity.title,
                    done: false,
                    is_temp: false
                }))

                const { error: entriesError } = await supabase
                    .from('log_entries')
                    .insert(entries)

                if (entriesError) throw entriesError
            }
        }

        // 4. Traer las entries del día con toda la info
        const { data: entries, error: entriesError } = await supabase
            .from('log_entries')
            .select('*')
            .eq('log_id', log.id)
            .order('created_at')

        if (entriesError) throw entriesError

        res.json({ log, entries })

    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Error al obtener el día actual' })
    }
})

module.exports = router