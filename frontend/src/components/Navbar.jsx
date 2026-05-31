import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const Navbar = () => {
    const { user, logout } = useAuth()
    const location = useLocation()

    const isActive = (path) => location.pathname === path

    return (
        <nav className="bg-gray-900 border-b border-gray-800 px-6 py-4">
            <div className="max-w-4xl mx-auto flex items-center justify-between">

                {/* Logo */}
                <span className="text-white font-bold text-xl tracking-tight">
                    ⏳ Cronos Flow
                </span>

                {/* Links */}
                <div className="flex items-center gap-6">
                    <Link
                        to="/"
                        className={`text-sm font-medium transition-colors ${isActive('/')
                            ? 'text-white'
                            : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        Hoy
                    </Link>
                    <Link
                        to="/history"
                        className={`text-sm font-medium transition-colors ${isActive('/history')
                            ? 'text-white'
                            : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        Historial
                    </Link>
                    <Link
                        to="/settings"
                        className={`text-sm font-medium transition-colors ${isActive('/settings')
                            ? 'text-white'
                            : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        Actividades
                    </Link>
                </div>

                {/* Usuario y logout */}
                <div className="flex items-center gap-3">
                    <span className="text-gray-400 text-sm hidden sm:block">
                        {user?.email}
                    </span>
                    <button
                        onClick={logout}
                        className="text-sm text-gray-400 hover:text-white transition-colors"
                    >
                        Salir
                    </button>
                </div>

            </div>
        </nav>
    )
}

export default Navbar