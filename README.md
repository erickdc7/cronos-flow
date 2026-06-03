# ⏳ Cronos Flow

**Cronos Flow** es una aplicación web fullstack para registrar y hacer seguimiento de tus actividades diarias. Permite definir una plantilla de actividades que se repite automáticamente cada día, marcarlas como completadas, agregar anotaciones, y consultar el historial de días anteriores.

🌐 **Live:** [cronos-flow-frontend.vercel.app](https://cronos-flow-notes.vercel.app/)

---

## 📋 Tabla de contenidos

- [Características](#-características)
- [Stack tecnológico](#-stack-tecnológico)
- [Arquitectura](#-arquitectura)
- [Estructura del proyecto](#-estructura-del-proyecto)
- [Base de datos](#-base-de-datos)
- [API Reference](#-api-reference)
- [Variables de entorno](#-variables-de-entorno)
- [Instalación y uso local](#-instalación-y-uso-local)
- [Deploy](#-deploy)
- [Decisiones técnicas](#-decisiones-técnicas)

---

## ✨ Características

- ✅ Registro diario automático — al entrar a la app se crea el log del día con todas tus actividades
- ✅ Actividades fijas (plantilla) — se repiten todos los días automáticamente
- ✅ Actividades temporales — se pueden agregar actividades solo para un día específico
- ✅ Checkboxes — marcar y desmarcar actividades como completadas
- ✅ Anotaciones — campo de nota opcional por actividad
- ✅ Barra de progreso — muestra el porcentaje de completitud del día
- ✅ Historial — consulta días anteriores con su detalle completo
- ✅ Gestión de actividades — crear, editar, activar/desactivar y eliminar actividades fijas
- ✅ Autenticación — registro e inicio de sesión con email y contraseña
- ✅ Multi-usuario — cada usuario tiene su propio espacio aislado

---

## 🛠 Stack tecnológico

### Frontend
| Tecnología | Versión | Uso |
|---|---|---|
| React | 19 | Librería de UI |
| Vite | 8 | Bundler y dev server |
| Tailwind CSS | 4 | Estilos utilitarios |
| React Router DOM | 7 | Enrutamiento del lado del cliente |
| Axios | 1.x | Cliente HTTP para consumir la API |
| Supabase JS | 2.x | Cliente para autenticación |

### Backend
| Tecnología | Versión | Uso |
|---|---|---|
| Node.js | 24 | Entorno de ejecución |
| Express | 5.x | Framework web para la API REST |
| @supabase/supabase-js | 2.x | Cliente para comunicarse con Supabase |
| dotenv | 16.x | Manejo de variables de entorno |
| cors | 2.x | Configuración de CORS |
| nodemon | 3.x | Hot reload en desarrollo |

### Infraestructura
| Servicio | Uso |
|---|---|
| Supabase | Base de datos PostgreSQL + Autenticación |
| Vercel | Deploy del frontend |
| Render | Deploy del backend |
| UptimeRobot | Monitor para evitar cold start del backend |
| GitHub | Control de versiones |

---

## 🏗 Arquitectura

```
Usuario (navegador)
        │
        ▼
┌───────────────────┐
│   React + Vite    │  → Vercel (cronos-flow-frontend.vercel.app)
│   (Frontend)      │
└────────┬──────────┘
         │ HTTP requests con JWT token
         ▼
┌───────────────────┐
│  Node.js + Express│  → Render (cronos-flow-backend.onrender.com)
│   (Backend API)   │
└────────┬──────────┘
         │ Supabase JS SDK
         ▼
┌───────────────────┐
│    Supabase        │  → PostgreSQL + Auth + RLS
│  (BD + Auth)      │
└───────────────────┘
```

### Flujo de autenticación

```
1. Usuario hace login en el frontend → Supabase Auth devuelve JWT token
2. React guarda el token en memoria (sesión de Supabase)
3. Axios interceptor adjunta el token en cada petición: Authorization: Bearer <token>
4. El middleware de Express valida el token contra Supabase Auth
5. Si es válido, adjunta el user a req.user y permite continuar
6. Supabase RLS verifica user_id en cada query a la base de datos
```

---

## 📁 Estructura del proyecto

```
cronos-flow/
├── backend/
│   ├── src/
│   │   ├── lib/
│   │   │   └── supabase.js         # Cliente Supabase con service key
│   │   ├── middlewares/
│   │   │   └── auth.js             # Middleware JWT de autenticación
│   │   ├── routes/
│   │   │   ├── today.js            # GET /api/today
│   │   │   ├── entries.js          # PATCH toggle/note, POST temp entry
│   │   │   ├── activities.js       # CRUD actividades fijas
│   │   │   └── history.js          # GET historial y detalle por fecha
│   │   └── server.js               # Entry point, configuración Express
│   ├── .env                        # Variables de entorno (no en git)
│   ├── .env.example                # Plantilla de variables
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ActivityItem.jsx    # Checkbox + nota por actividad
│   │   │   ├── Navbar.jsx          # Navegación principal
│   │   │   └── ProtectedRoute.jsx  # HOC para rutas autenticadas
│   │   ├── hooks/
│   │   │   └── useAuth.js          # Hook para estado de autenticación
│   │   ├── lib/
│   │   │   ├── supabase.js         # Cliente Supabase con publishable key
│   │   │   └── api.js              # Funciones para consumir el backend
│   │   ├── pages/
│   │   │   ├── Login.jsx           # Login y registro
│   │   │   ├── Today.jsx           # Vista del día actual
│   │   │   ├── History.jsx         # Historial de días pasados
│   │   │   └── Settings.jsx        # Gestión de actividades fijas
│   │   ├── App.jsx                 # Rutas y layout principal
│   │   └── main.jsx                # Entry point React
│   ├── .env                        # Variables de entorno (no en git)
│   ├── .env.example                # Plantilla de variables
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## 🗄 Base de datos

La base de datos está en **Supabase (PostgreSQL)** con Row Level Security (RLS) activado en todas las tablas. Cada usuario solo puede ver y modificar sus propios datos.

### Esquema

```sql
-- Actividades fijas (plantilla diaria del usuario)
activities (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  description TEXT,
  order_index INTEGER DEFAULT 0,
  is_active   BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT now()
)

-- Un registro por día por usuario
daily_logs (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date       DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, date)
)

-- Estado de cada actividad en cada día
log_entries (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  log_id      UUID REFERENCES daily_logs(id) ON DELETE CASCADE,
  activity_id UUID REFERENCES activities(id) ON DELETE SET NULL,
  title       TEXT NOT NULL,
  done        BOOLEAN DEFAULT false,
  note        TEXT,
  is_temp     BOOLEAN DEFAULT false,
  created_at  TIMESTAMPTZ DEFAULT now()
)
```

### Relaciones

```
auth.users (Supabase Auth)
    │
    ├── activities (1:N) → actividades fijas del usuario
    │
    └── daily_logs (1:N) → un log por día
            │
            └── log_entries (1:N) → estado de cada actividad en ese día
                    │
                    └── activities (FK opcional) → referencia a la actividad base
```

### Lógica de creación del día

Cada vez que el usuario accede a la ruta `/api/today`:

1. Se busca si existe un `daily_log` para la fecha actual
2. Si no existe, se crea automáticamente
3. Se copian todas las `activities` activas del usuario como `log_entries`
4. Se devuelve el log con sus entries

---

## 🔌 API Reference

Todas las rutas (excepto `/health`) requieren el header:
```
Authorization: Bearer <supabase_jwt_token>
```

### Health
```
GET /health
→ { status: "ok", message: "Cronos Flow API running" }
```

### Today
```
GET /api/today
→ { log: DailyLog, entries: LogEntry[] }
```

### Entries
```
PATCH /api/entries/:id/toggle
→ LogEntry (con done invertido)

PATCH /api/entries/:id/note
Body: { note: string }
→ LogEntry (con nota actualizada)

POST /api/entries
Body: { log_id: string, title: string }
→ LogEntry (actividad temporal, is_temp: true)
```

### Activities
```
GET    /api/activities
→ Activity[]

POST   /api/activities
Body: { title: string, description?: string }
→ Activity

PATCH  /api/activities/:id
Body: { title?, description?, is_active?, order_index? }
→ Activity

DELETE /api/activities/:id
→ { message: "Actividad eliminada correctamente" }
```

### History
```
GET /api/history
→ Array de DailyLog con campos extra: { total: number, completed: number }

GET /api/history/:date
Params: date en formato "YYYY-MM-DD"
→ { log: DailyLog, entries: LogEntry[] }
```

---

## 🔐 Variables de entorno

### Backend (`backend/.env`)
```env
PORT=3000
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_SECRET_KEY=sb_secret_...
FRONTEND_URL=https://cronos-flow-frontend.vercel.app
```

### Frontend (`frontend/.env`)
```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
VITE_API_URL=http://localhost:3000
```

> ⚠️ Nunca subas los archivos `.env` a GitHub. Los archivos `.env.example` sirven como plantilla.

---

## 💻 Instalación y uso local

### Prerrequisitos
- Node.js v20 o superior
- Cuenta en [Supabase](https://supabase.com)
- Git

### 1. Clonar el repositorio
```bash
git clone https://github.com/erickdc7/cronos-flow.git
cd cronos-flow
```

### 2. Configurar Supabase
1. Crea un proyecto en [supabase.com](https://supabase.com)
2. Ve al SQL Editor y ejecuta el esquema completo de la sección [Base de datos](#-base-de-datos)
3. Ejecuta también los `GRANT` de permisos:
```sql
GRANT ALL ON public.activities TO service_role;
GRANT ALL ON public.daily_logs TO service_role;
GRANT ALL ON public.log_entries TO service_role;
```
4. Copia tu `Project URL`, `Publishable Key` y `Secret Key` desde Settings → API

### 3. Configurar el backend
```bash
cd backend
npm install
cp .env.example .env
# Edita .env con tus credenciales de Supabase
npm run dev
```

### 4. Configurar el frontend
```bash
cd ../frontend
npm install
cp .env.example .env
# Edita .env con tus credenciales de Supabase
npm run dev
```

### 5. Abrir la app
Abre [http://localhost:5173](http://localhost:5173) en tu navegador.

---

## 🚀 Deploy

### Frontend → Vercel

1. Conecta el repositorio en [vercel.com](https://vercel.com)
2. Configura:
   - **Root Directory:** `frontend`
   - **Framework Preset:** Vite (se detecta automáticamente)
3. Agrega las variables de entorno:
   ```
   VITE_SUPABASE_URL
   VITE_SUPABASE_PUBLISHABLE_KEY
   VITE_API_URL  → URL del backend en Render
   ```
4. Deploy automático en cada push a `main`

### Backend → Render

1. Crea un **Web Service** en [render.com](https://render.com)
2. Configura:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** Free
3. Agrega las variables de entorno:
   ```
   PORT
   SUPABASE_URL
   SUPABASE_SECRET_KEY
   FRONTEND_URL  → URL del frontend en Vercel
   ```
4. Deploy automático en cada push a `main`

### Evitar cold start — UptimeRobot

El plan gratuito de Render suspende el servidor tras 15 minutos de inactividad. Para evitarlo:

1. Crea una cuenta en [uptimerobot.com](https://uptimerobot.com)
2. Agrega un monitor HTTP apuntando a:
   ```
   https://tu-backend.onrender.com/health
   ```
3. Intervalo: cada 5 minutos

---

## 🧠 Decisiones técnicas

### ¿Por qué Node.js + Express y no directamente Supabase desde el frontend?

Se eligió mantener un backend propio por varias razones:
- **Separación de responsabilidades** — la lógica de negocio (crear el log del día, copiar actividades) vive en el servidor, no en el cliente
- **Seguridad** — la `service_role` key de Supabase nunca se expone al navegador
- **Extensibilidad** — facilita agregar integraciones externas, emails, o procesos programados en el futuro
- **Aprendizaje** — construir una API REST completa es más valioso que delegar todo a un BaaS

### ¿Por qué PostgreSQL y no SQLite?

SQLite es un archivo local ideal para desarrollo, pero en servidores en la nube el sistema de archivos no es persistente. PostgreSQL en Supabase ofrece persistencia real, backups automáticos y acceso remoto sin costo adicional.

### ¿Por qué Vercel + Render y no un solo servicio?

- **Vercel** está optimizado para frontends estáticos y frameworks de React, con CDN global incluido
- **Render** está optimizado para backends Node.js con deploy desde GitHub
- Separarlos permite escalar cada capa independientemente si el proyecto crece

---

## 📄 Licencia

MIT © [erickdc7](https://github.com/erickdc7)
