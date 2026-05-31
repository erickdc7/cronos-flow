const express = require('express')
const router = express.Router()
const supabase = require('../lib/supabase')

// PATCH /api/entries/:id/toggle — marcar o desmarcar una actividad
router.patch('/:id/toggle', async (req, res) => {
    const { id } = req.params

    try {
        // 1. Traer el estado actual
        const { data: entry, error: fetchError } = await supabase
            .from('log_entries')
            .select('*')
            .eq('id', id)
            .single()

        if (fetchError || !entry) {
            return res.status(404).json({ error: 'Entrada no encontrada' })
        }

        // 2. Invertir el estado
        const { data: updated, error: updateError } = await supabase
            .from('log_entries')
            .update({ done: !entry.done })
            .eq('id', id)
            .select()
            .single()

        if (updateError) throw updateError

        res.json(updated)

    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Error al actualizar la actividad' })
    }
})

// PATCH /api/entries/:id/note — guardar una anotación
router.patch('/:id/note', async (req, res) => {
    const { id } = req.params
    const { note } = req.body

    if (note === undefined) {
        return res.status(400).json({ error: 'El campo note es requerido' })
    }

    try {
        const { data: updated, error } = await supabase
            .from('log_entries')
            .update({ note })
            .eq('id', id)
            .select()
            .single()

        if (error) throw error

        res.json(updated)

    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Error al guardar la nota' })
    }
})

// POST /api/entries — agregar actividad temporal (solo para hoy)
router.post('/', async (req, res) => {
    const { log_id, title } = req.body

    if (!log_id || !title) {
        return res.status(400).json({ error: 'log_id y title son requeridos' })
    }

    try {
        const { data: entry, error } = await supabase
            .from('log_entries')
            .insert({
                log_id,
                title,
                done: false,
                is_temp: true
            })
            .select()
            .single()

        if (error) throw error

        res.status(201).json(entry)

    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Error al crear la actividad temporal' })
    }
})

// DELETE /api/entries/:id — eliminar actividad temporal
router.delete('/:id', async (req, res) => {
    const { id } = req.params

    try {
        // Verificar que existe y es temporal
        const { data: entry, error: fetchError } = await supabase
            .from('log_entries')
            .select('*')
            .eq('id', id)
            .eq('is_temp', true)
            .single()

        if (fetchError || !entry) {
            return res.status(404).json({ error: 'Actividad no encontrada o no es temporal' })
        }

        const { error } = await supabase
            .from('log_entries')
            .delete()
            .eq('id', id)

        if (error) throw error

        res.json({ message: 'Actividad eliminada' })

    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Error al eliminar la actividad' })
    }
})

module.exports = router