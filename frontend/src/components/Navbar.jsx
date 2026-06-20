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
            <nav className="sticky top-0 z-40 bg-[var(--color-zinc-950-80)] backdrop-blur-xl border-b border-[var(--color-border)]">
                <div className="max-w-4xl mx-auto flex items-center justify-between px-[var(--space-4)] sm:px-[var(--space-6)] h-16">

                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 group">
                        <div className="w-8 h-8 rounded-[var(--radius-lg)] bg-[var(--color-accent-bg)] border border-[var(--color-accent-border)] flex items-center justify-center transition-colors-base group-hover:bg-[var(--color-accent-bg-hover)]">
                            <Timer className="w-4 h-4 text-[var(--color-accent-text)]" strokeWidth={2} />
                        </div>
                        <span className="text-[var(--color-text-primary)] font-semibold text-sm tracking-tight hidden sm:block">
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
                                    relative flex items-center gap-[var(--space-1-5)] px-[var(--space-3)] py-[var(--space-2)] rounded-[var(--radius-lg)] text-sm font-medium
                                    transition-colors duration-200
                                    ${isActive(to)
                                        ? 'text-[var(--color-text-primary)] bg-[var(--color-bg-nav-active)]'
                                        : 'text-[var(--color-text-disabled)] hover:text-[var(--color-text-tertiary)] hover:bg-[var(--color-zinc-900-40)]'
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
                            <span className="text-[var(--color-warning-text)] text-xs hidden md:flex items-center gap-1 bg-[var(--color-warning-bg)] border border-[var(--color-warning-border)] px-[var(--space-2)] py-[var(--space-1)] rounded-[var(--radius-full)] font-medium">
                                Invitado
                            </span>
                        ) : (
                            <span className="text-[var(--color-text-disabled)] text-xs hidden md:block truncate max-w-[160px]">
                                {user?.email}
                            </span>
                        )}
                        <button
                            onClick={handleLogoutClick}
                            className="flex items-center gap-[var(--space-1-5)] text-[var(--color-text-disabled)] hover:text-[var(--color-text-tertiary)] transition-colors-base text-sm px-[var(--space-2)] py-[var(--space-1-5)] rounded-[var(--radius-lg)] hover:bg-[var(--color-zinc-900-40)]"
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
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-[var(--space-4)]">
                    <div className="bg-[var(--color-zinc-900)] border border-[var(--color-zinc-800)] rounded-[var(--radius-xl)] p-[var(--space-6)] max-w-sm w-full relative">
                        <button
                            onClick={() => setShowGuestModal(false)}
                            className="absolute top-4 right-4 text-[var(--color-text-disabled)] hover:text-[var(--color-text-tertiary)] transition-colors-base"
                        >
                            <X className="w-4 h-4" strokeWidth={2} />
                        </button>

                        <div className="w-12 h-12 rounded-[var(--radius-full)] bg-[var(--color-warning-bg)] border border-[var(--color-warning-border)] flex items-center justify-center mb-[var(--space-4)]">
                            <AlertTriangle className="w-6 h-6 text-[var(--color-warning-text)]" strokeWidth={1.5} />
                        </div>

                        <h2 className="text-[var(--color-text-primary)] font-semibold text-base mb-[var(--space-2)]">
                            Perderás tus datos
                        </h2>
                        <p className="text-[var(--color-text-disabled)] text-sm mb-[var(--space-5)] leading-relaxed">
                            Estás usando una cuenta de invitado. Si salís ahora, todas tus actividades y registros de prueba se perderán para siempre.
                        </p>

                        <div className="flex flex-col gap-2">
                            <button
                                onClick={handleConfirmExit}
                                className="w-full bg-[var(--color-accent)] text-[var(--color-zinc-950)] font-semibold py-[var(--space-2-5)] rounded-[var(--radius-lg)] hover:bg-[var(--color-accent-hover)] transition-colors-base disabled:bg-[var(--color-zinc-800-60)] disabled:text-[var(--color-text-disabled-on-bg)] text-sm"
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