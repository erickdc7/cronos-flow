import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const Login = () => {
    const { user, loading } = useAuth()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [isRegister, setIsRegister] = useState(false)
    const [error, setError] = useState(null)
    const [success, setSuccess] = useState(null)
    const [submitting, setSubmitting] = useState(false)

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-950">
                <p className="text-gray-400">Cargando...</p>
            </div>
        )
    }

    if (user) return <Navigate to="/" replace />

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError(null)
        setSuccess(null)
        setSubmitting(true)

        try {
            if (isRegister) {
                if (password !== confirmPassword) {
                    setError('Las contraseñas no coinciden')
                    setSubmitting(false)
                    return
                }
                const { error } = await supabase.auth.signUp({ email, password })
                if (error) throw error
                setSuccess('Cuenta creada. Revisa tu email para confirmar.')
            }
        } catch (err) {
            setError(err.message)
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
            <div className="w-full max-w-md">

                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2">⏳ Cronos Flow</h1>
                    <p className="text-gray-400">Tu registro diario de actividades</p>
                </div>

                {/* Card */}
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
                    <h2 className="text-white font-semibold text-lg mb-6">
                        {isRegister ? 'Crear cuenta' : 'Iniciar sesión'}
                    </h2>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <div>
                            <label className="text-gray-400 text-sm mb-1 block">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="tu@email.com"
                                className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 border border-gray-700 focus:outline-none focus:border-gray-500 text-sm"
                            />
                        </div>

                        <div>
                            <label className="text-gray-400 text-sm mb-1 block">Contraseña</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder="••••••••"
                                className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 border border-gray-700 focus:outline-none focus:border-gray-500 text-sm"
                            />
                        </div>

                        {isRegister && (
                            <div>
                                <label className="text-gray-400 text-sm mb-1 block">Confirmar contraseña</label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required={isRegister}
                                    placeholder="••••••••"
                                    className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 border border-gray-700 focus:outline-none focus:border-gray-500 text-sm"
                                />
                            </div>
                        )}

                        {error && (
                            <p className="text-red-400 text-sm bg-red-400/10 px-4 py-2 rounded-lg">
                                {error}
                            </p>
                        )}

                        {success && (
                            <p className="text-green-400 text-sm bg-green-400/10 px-4 py-2 rounded-lg">
                                {success}
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full bg-white text-gray-950 font-semibold py-3 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 text-sm"
                        >
                            {submitting
                                ? 'Cargando...'
                                : isRegister ? 'Crear cuenta' : 'Entrar'
                            }
                        </button>
                    </form>

                    <p className="text-center text-gray-500 text-sm mt-6">
                        {isRegister ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'}{' '}
                        <button
                            onClick={() => {
                                setIsRegister(!isRegister)
                                setError(null)
                                setSuccess(null)
                            }}
                            className="text-white hover:underline"
                        >
                            {isRegister ? 'Inicia sesión' : 'Regístrate'}
                        </button>
                    </p>
                </div>

            </div>
        </div>
    )
}

export default Login