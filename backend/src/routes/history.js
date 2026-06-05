const express = require('express')
const router = express.Router()
const supabase = require('../lib/supabase')

// GET /api/history — traer lista de todos los días registrados
router.get('/', async (req, res) => {
    const userId = req.user.id

    try {
        const { data: logs, error } = await supabase
            .from('daily_logs')
            .select('*')
            .eq('user_id', userId)
            .order('date', { ascending: false })

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

        res.json(logsWithStats)

    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Error al obtener el historial' })
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