import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, useReducedMotion } from 'motion/react'
import { supabase } from '../lib/supabase'
import { Timer, AlertCircle, CheckCircle2 } from 'lucide-react'
import LoadingSpinner from '../components/LoadingSpinner'

const ResetPassword = () => {
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [error, setError] = useState(null)
    const [success, setSuccess] = useState(null)
    const [submitting, setSubmitting] = useState(false)
    const [validSession, setValidSession] = useState(false)
    const [checking, setChecking] = useState(true)
    const navigate = useNavigate()
    const shouldReduceMotion = useReducedMotion()

    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'PASSWORD_RECOVERY') {
                setValidSession(true)
                setChecking(false)
            } else if (event === 'SIGNED_IN' && session) {
                // También válido si ya procesó el token
                setValidSession(true)
                setChecking(false)
            }
        })

        // Timeout por si el evento nunca llega
        const timeout = setTimeout(() => {
            setChecking(false)
        }, 3000)

        return () => {
            subscription.unsubscribe()
            clearTimeout(timeout)
        }
    }, [])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError(null)

        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden')
            return
        }

        if (password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres')
            return
        }

        setSubmitting(true)
        try {
            const { error } = await supabase.auth.updateUser({ password })
            if (error) throw error
            setSuccess('Contraseña actualizada correctamente. Redirigiendo...')
            setTimeout(() => navigate('/'), 2000)
        } catch (err) {
            setError(err.message)
        } finally {
            setSubmitting(false)
        }
    }

    if (checking) {
        return (
            <div className="min-h-[100dvh] flex items-center justify-center bg-zinc-950">
                <LoadingSpinner message="Verificando enlace..." />
            </div>
        )
    }

    if (!validSession) {
        return (
            <div className="min-h-[100dvh] flex items-center justify-center bg-zinc-950 px-4">
                <div className="text-center">
                    <p className="text-zinc-400 text-sm mb-4">El enlace no es válido o ya expiró.</p>
                    <button
                        onClick={() => navigate('/login')}
                        className="text-emerald-400 hover:text-emerald-300 text-sm transition-colors duration-200"
                    >
                        Volver al login
                    </button>
                </div>
            </div>
        )
    }

    const MotionDiv = shouldReduceMotion ? 'div' : motion.div

    return (
        <div className="min-h-[100dvh] bg-zinc-950 flex items-center justify-center px-4">
            <div className="w-full max-w-sm">

                {/* Brand Mark */}
                <MotionDiv
                    className="flex flex-col items-center mb-8"
                    {...(shouldReduceMotion ? {} : {
                        initial: { opacity: 0, y: -8 },
                        animate: { opacity: 1, y: 0 },
                        transition: { duration: 0.5, ease: [0.23, 1, 0.32, 1] }
                    })}
                >
                    <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4">
                        <Timer className="w-7 h-7 text-emerald-400" strokeWidth={1.5} />
                    </div>
                    <h1 className="text-xl font-semibold text-zinc-100 tracking-tight">Cronos Flow</h1>
                    <p className="text-zinc-500 text-sm mt-1">Establece tu nueva contraseña</p>
                </MotionDiv>

                {/* Form Card */}
                <MotionDiv
                    className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl p-6"
                    {...(shouldReduceMotion ? {} : {
                        initial: { opacity: 0, y: 16 },
                        animate: { opacity: 1, y: 0 },
                        transition: { duration: 0.5, delay: 0.1, ease: [0.23, 1, 0.32, 1] }
                    })}
                >
                    <h2 className="text-zinc-200 font-medium text-base mb-5">Nueva contraseña</h2>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <div>
                            <label className="text-zinc-400 text-xs font-medium mb-1.5 block">Nueva contraseña</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder="••••••••"
                                className="w-full bg-zinc-800/60 text-zinc-100 rounded-lg px-3.5 py-2.5 border border-zinc-700/60 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 text-sm transition-colors duration-200 placeholder:text-zinc-600"
                            />
                        </div>

                        <div>
                            <label className="text-zinc-400 text-xs font-medium mb-1.5 block">Confirmar contraseña</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                placeholder="••••••••"
                                className="w-full bg-zinc-800/60 text-zinc-100 rounded-lg px-3.5 py-2.5 border border-zinc-700/60 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 text-sm transition-colors duration-200 placeholder:text-zinc-600"
                            />
                        </div>

                        {error && (
                            <div className="flex items-start gap-2 text-red-400 text-sm bg-red-400/8 border border-red-400/15 px-3.5 py-2.5 rounded-lg">
                                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" strokeWidth={2} />
                                <span>{error}</span>
                            </div>
                        )}

                        {success && (
                            <div className="flex items-start gap-2 text-emerald-400 text-sm bg-emerald-400/8 border border-emerald-400/15 px-3.5 py-2.5 rounded-lg">
                                <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" strokeWidth={2} />
                                <span>{success}</span>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full bg-emerald-500 text-zinc-950 font-semibold py-2.5 rounded-lg hover:bg-emerald-400 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                        >
                            {submitting ? 'Guardando...' : 'Actualizar contraseña'}
                        </button>
                    </form>
                </MotionDiv>
            </div>
        </div>
    )
}

export default ResetPassword