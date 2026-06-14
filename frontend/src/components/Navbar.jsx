import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { getActivities } from '../lib/api'
import { Timer, CalendarDays, Clock, ListTodo, LogOut, AlertTriangle, X } from 'lucide-react'

const navLinks = [
    { to: '/', label: 'Hoy', icon: Clock },
    { to: '/history', label: 'Historial', icon: CalendarDays },
    { to: '/settings', label: 'Actividades', icon: ListTodo },
]

const Navbar = () => {
    const { user, logout } = useAuth()
    const location = useLocation()
    const [showGuestModal, setShowGuestModal] = useState(false)

    const isActive = (path) => location.pathname === path
    const isGuest = user?.is_anonymous

    const handleLogoutClick = async () => {
        if (isGuest) {
            try {
                const { data } = await getActivities()
                if (data && data.length > 0) {
                    setShowGuestModal(true)
                } else {
                    await logout()
                }
            } catch (err) {
                console.error(err)
                setShowGuestModal(true) // por seguridad, si falla mostrar el modal
            }
        } else {
            logout()
        }
    }

    const handleConfirmExit = async () => {
        await logout()
        setShowGuestModal(false)
    }

    return (
        <>
            <nav className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800/60">
                <div className="max-w-4xl mx-auto flex items-center justify-between px-4 sm:px-6 h-16">

                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 group">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center transition-colors duration-200 group-hover:bg-emerald-500/15">
                            <Timer className="w-4 h-4 text-emerald-400" strokeWidth={2} />
                        </div>
                        <span className="text-zinc-100 font-semibold text-sm tracking-tight hidden sm:block">
                            Cronos Flow
                        </span>
                    </Link>

                    {/* Navigation Links */}
                    <div className="flex items-center gap-1">
                        {navLinks.map(({ to, label, icon: Icon }) => (
                            <Link
                                key={to}
                                to={to}
                                className={`
                                    relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium
                                    transition-colors duration-200
                                    ${isActive(to)
                                        ? 'text-zinc-100 bg-zinc-800/60'
                                        : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/30'
                                    }
                                `}
                            >
                                <Icon className="w-4 h-4" strokeWidth={isActive(to) ? 2 : 1.5} />
                                <span className="hidden sm:inline">{label}</span>
                            </Link>
                        ))}
                    </div>

                    {/* User & Logout */}
                    <div className="flex items-center gap-3">
                        {isGuest ? (
                            <span className="text-amber-400/80 text-xs hidden md:flex items-center gap-1 bg-amber-400/8 border border-amber-400/15 px-2 py-1 rounded-full font-medium">
                                Invitado
                            </span>
                        ) : (
                            <span className="text-zinc-600 text-xs hidden md:block truncate max-w-[160px]">
                                {user?.email}
                            </span>
                        )}
                        <button
                            onClick={handleLogoutClick}
                            className="flex items-center gap-1.5 text-zinc-600 hover:text-zinc-300 transition-colors duration-200 text-sm px-2 py-1.5 rounded-lg hover:bg-zinc-800/40"
                            title="Cerrar sesión"
                        >
                            <LogOut className="w-4 h-4" strokeWidth={1.5} />
                            <span className="hidden sm:inline text-xs">Salir</span>
                        </button>
                    </div>

                </div>
            </nav>

            {/* Guest exit warning modal */}
            {showGuestModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 max-w-sm w-full relative">
                        <button
                            onClick={() => setShowGuestModal(false)}
                            className="absolute top-4 right-4 text-zinc-600 hover:text-zinc-300 transition-colors duration-200"
                        >
                            <X className="w-4 h-4" strokeWidth={2} />
                        </button>

                        <div className="w-12 h-12 rounded-full bg-amber-400/10 border border-amber-400/20 flex items-center justify-center mb-4">
                            <AlertTriangle className="w-6 h-6 text-amber-400" strokeWidth={1.5} />
                        </div>

                        <h2 className="text-zinc-100 font-semibold text-base mb-2">
                            Perderás tus datos
                        </h2>
                        <p className="text-zinc-500 text-sm mb-5 leading-relaxed">
                            Estás usando una cuenta de invitado. Si salís ahora, todas tus actividades y registros de prueba se perderán para siempre.
                        </p>

                        <div className="flex flex-col gap-2">
                            <button
                                onClick={handleConfirmExit}
                                className="w-full bg-emerald-500 text-zinc-950 font-semibold py-2.5 rounded-lg hover:bg-emerald-400 transition-colors duration-200 text-sm"
                            >
                                Salir de todas formas
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default Navbar