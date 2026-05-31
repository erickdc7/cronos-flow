const express = require('express')
const router = express.Router()
const supabase = require('../lib/supabase')

// GET /api/activities — traer todas las actividades fijas
router.get('/', async (req, res) => {
    const userId = req.user.id

    try {
        const { data, error } = await supabase
            .from('activities')
            .select('*')
            .eq('user_id', userId)
            .order('order_index')

        if (error) throw error

        res.json(data)

    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Error al obtener las actividades' })
    }
})

// POST /api/activities — crear una actividad fija permanente
router.post('/', async (req, res) => {
    const userId = req.user.id
    const { title, description } = req.body

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
                order_index: nextIndex
            })
            .select()
            .single()

        if (error) throw error

        res.status(201).json(data)

    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Error al crear la actividad' })
    }
})

// PATCH /api/activities/:id — editar una actividad fija
router.patch('/:id', async (req, res) => {
    const { id } = req.params
    const { title, description, is_active, order_index } = req.body

    try {
        const updates = {}
        if (title !== undefined) updates.title = title
        if (description !== undefined) updates.description = description
        if (is_active !== undefined) updates.is_active = is_active
        if (order_index !== undefined) updates.order_index = order_index

        const { data, error } = await supabase
            .from('activities')
            .update(updates)
            .eq('id', id)
            .eq('user_id', req.user.id)
            .select()
            .single()

        if (error) throw error

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

module.exports = router