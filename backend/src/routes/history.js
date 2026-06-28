const express = require('express')
const router = express.Router()
const supabase = require('../lib/supabase')
const { matchesSchedule } = require('../lib/schedule')

// GET /api/history — traer lista de todos los días registrados (paginado)
router.get('/', async (req, res) => {
    const userId = req.user.id
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1)
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 7, 1), 31)
    const from = (page - 1) * limit
    const to = from + limit - 1

    try {
        const { data: logs, error, count } = await supabase
            .from('daily_logs')
            .select('*', { count: 'exact' })
            .eq('user_id', userId)
            .order('date', { ascending: false })
            .range(from, to)

        if (error) throw error

        // Para cada día, contar cuántas actividades hay y cuántas se completaron
        const logsWithStats = await Promise.all(
            logs.map(async (log) => {
                const { data: entries } = await supabase
                    .from('log_entries')
                    .select('done')
                    .eq('log_id', log.id)

                const total = entries?.length || 0
                const completed = entries?.filter(e => e.done).length || 0

                return { ...log, total, completed }
            })
        )

        res.json({
            logs: logsWithStats,
            pagination: {
                page,
                limit,
                total: count || 0,
                totalPages: Math.ceil((count || 0) / limit),
                hasPreviousPage: page > 1,
                hasNextPage: to + 1 < (count || 0)
            }
        })

    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Error al obtener el historial' })
    }
})

// GET /api/history/stats — todos los días con stats (optimizado, 1 query con join)
router.get('/stats', async (req, res) => {
    const userId = req.user.id

    try {
        const { data: logs, error } = await supabase
            .from('daily_logs')
            .select('date, log_entries(done, is_temp, activity_id)')
            .eq('user_id', userId)
            .order('date', { ascending: true })

        if (error) throw error

        // Traer todas las actividades del usuario con su schedule
        const { data: activities } = await supabase
            .from('activities')
            .select('id, schedule')
            .eq('user_id', userId)

        const activityScheduleMap = new Map(
            (activities || []).map(a => [a.id, a.schedule])
        )

        const stats = logs.map(log => {
            const entries = log.log_entries || []

            // Filtrar entries igual que en today.js:
            // incluir temporales siempre, y permanentes solo si su schedule coincide con la fecha del log
            const visibleEntries = entries.filter(entry => {
                if (entry.is_temp) return true
                if (!entry.activity_id) return false
                const schedule = activityScheduleMap.get(entry.activity_id)
                return matchesSchedule(schedule || 'daily', log.date)
            })

            const total = visibleEntries.length
            const completed = visibleEntries.filter(e => e.done).length
            return { date: log.date, completed, total }
        })

        res.json(stats)

    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Error al obtener las estadísticas' })
    }
})

// GET /api/history/:date — detalle de un día específico
router.get('/:date', async (req, res) => {
    const userId = req.user.id
    const { date } = req.params

    try {
        const { data: log, error: logError } = await supabase
            .from('daily_logs')
            .select('*')
            .eq('user_id', userId)
            .eq('date', date)
            .single()

        if (logError || !log) {
            return res.status(404).json({ error: 'No hay registro para esa fecha' })
        }

        const { data: entries, error: entriesError } = await supabase
            .from('log_entries')
            .select('*')
            .eq('log_id', log.id)
            .order('done', { ascending: false })
            .order('title', { ascending: true })

        if (entriesError) throw entriesError

        res.json({ log, entries })

    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Error al obtener el detalle del día' })
    }
})

module.exports = router
