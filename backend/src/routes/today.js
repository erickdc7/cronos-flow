const express = require('express')
const router = express.Router()
const supabase = require('../lib/supabase')
const { matchesSchedule, isSpecificDate } = require('../lib/schedule')

// GET /api/today — trae o crea el log del día actual
router.get('/', async (req, res) => {
    const userId = req.user.id
    const today = new Date().toLocaleDateString('en-CA', { timeZone: req.timezone }) // "2026-05-31"

    try {
        // 0. Auto-deactivate specific-date activities whose date has passed
        const { data: expiredActivities } = await supabase
            .from('activities')
            .select('id, schedule')
            .eq('user_id', userId)
            .eq('is_active', true)

        if (expiredActivities) {
            const toDeactivate = expiredActivities.filter(a =>
                isSpecificDate(a.schedule) && a.schedule < today
            )
            if (toDeactivate.length > 0) {
                await supabase
                    .from('activities')
                    .update({ is_active: false })
                    .in('id', toDeactivate.map(a => a.id))
            }
        }

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

            // 3. Copiar actividades activas cuyo schedule coincida con hoy
            const { data: activities, error: activitiesError } = await supabase
                .from('activities')
                .select('*')
                .eq('user_id', userId)
                .eq('is_active', true)
                .order('order_index')

            if (activitiesError) throw activitiesError

            if (activities && activities.length > 0) {
                const matchingActivities = activities.filter(a =>
                    matchesSchedule(a.schedule, today)
                )

                if (matchingActivities.length > 0) {
                    const entries = matchingActivities.map(activity => ({
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
        }

        // 4. Traer las entries del día con toda la info
        const { data: entries, error: entriesError } = await supabase
            .from('log_entries')
            .select('*')
            .eq('log_id', log.id)
            .order('title', { ascending: true })

        if (entriesError) throw entriesError

        const activityIds = entries
            .map(entry => entry.activity_id)
            .filter(Boolean)

        // Traer actividades con su schedule para verificar frecuencia
        let activeActivitiesMap = new Map()

        if (activityIds.length > 0) {
            const { data: activeActivities } = await supabase
                .from('activities')
                .select('id, schedule')
                .eq('user_id', userId)
                .eq('is_active', true)
                .in('id', activityIds)

            activeActivities?.forEach(a => activeActivitiesMap.set(a.id, a))
        }

        const visibleEntries = entries.filter(entry => {
            if (entry.is_temp) return true
            const activity = activeActivitiesMap.get(entry.activity_id)
            if (!activity) return false
            return matchesSchedule(activity.schedule, today)
        })

        res.json({ log, entries: visibleEntries })

    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Error al obtener el día actual' })
    }
})

module.exports = router
