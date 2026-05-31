const express = require('express')
const cors = require('cors')
require('dotenv').config()

const authMiddleware = require('./middlewares/auth')
const todayRoutes = require('./routes/today')
const entriesRoutes = require('./routes/entries')
const activitiesRoutes = require('./routes/activities')
const historyRoutes = require('./routes/history')

const app = express()
const PORT = process.env.PORT || 3000

// Middlewares globales
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
}))
app.use(express.json())

// Ruta de salud — para verificar que el servidor está vivo
app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'Cronos Flow API running' })
})

// Rutas protegidas — todas requieren token
app.use('/api/today', authMiddleware, todayRoutes)
app.use('/api/entries', authMiddleware, entriesRoutes)
app.use('/api/activities', authMiddleware, activitiesRoutes)
app.use('/api/history', authMiddleware, historyRoutes)

// Manejo de rutas no encontradas
app.use((req, res) => {
    res.status(404).json({ error: 'Ruta no encontrada' })
})

app.listen(PORT, () => {
    console.log(`🚀 Cronos Flow API corriendo en http://localhost:${PORT}`)
})