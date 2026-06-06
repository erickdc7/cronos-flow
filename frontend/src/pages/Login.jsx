import { useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { supabase } from '../lib/supabase'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Timer, AlertCircle, CheckCircle2 } from 'lucide-react'
import LoadingSpinner from '../components/LoadingSpinner'

const Login = () => {
    const { user, loading } = useAuth()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [isRegister, setIsRegister] = useState(false)
    const [error, setError] = useState(null)
    const [success, setSuccess] = useState(null)
    const [submitting, setSubmitting] = useState(false)
    const [isForgotPassword, setIsForgotPassword] = useState(false)
    const [forgotEmail, setForgotEmail] = useState('')
    const [forgotSubmitting, setForgotSubmitting] = useState(false)
    const shouldReduceMotion = useReducedMotion()

    if (loading) {
        return (
            <div className="min-h-[100dvh] flex items-center justify-center bg-zinc-950">
                <LoadingSpinner message="Cargando..." />
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
            } else {
                const { error } = await supabase.auth.signInWithPassword({ email, password })
                if (error) throw error
            }
        } catch (err) {
            setError(err.message)
        } finally {
            setSubmitting(false)
        }
    }

    const handleForgotPassword = async (e) => {
        e.preventDefault()
        setError(null)
        setSuccess(null)
        setForgotSubmitting(true)
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
                redirectTo: `https://cronos-flow-notes.vercel.app/reset-password`
            })
            if (error) throw error
            setSuccess('Revisa tu email, te enviamos un enlace para restablecer tu contraseña.')
        } catch (err) {
            setError(err.message)
        } finally {
            setForgotSubmitting(false)
        }
    }

    const MotionDiv = shouldReduceMotion ? 'div' : motion.div

    const formItemProps = (delay) => shouldReduceMotion ? {} : {
        initial: { opacity: 0, y: 12 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.4, delay, ease: [0.23, 1, 0.32, 1] }
    }

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
                    <p className="text-zinc-500 text-sm mt-1">Tu registro diario de actividades</p>
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
                    {isForgotPassword ? (
                        /* ── Forgot Password Form ── */
                        <div>
                            <h2 className="text-zinc-200 font-medium text-base mb-5">Restablecer contraseña</h2>
                            <form onSubmit={handleForgotPassword} className="flex flex-col gap-4">
                                <div>
                                    <label className="text-zinc-400 text-xs font-medium mb-1.5 block">Email</label>
                                    <input
                                        type="email"
                                        value={forgotEmail}
                                        onChange={(e) => setForgotEmail(e.target.value)}
                                        required
                                        placeholder="tu@email.com"
                                        autoFocus
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
                                    disabled={forgotSubmitting}
                                    className="w-full bg-emerald-500 text-zinc-950 font-semibold py-2.5 rounded-lg hover:bg-emerald-400 transition-colors duration-200 disabled:opacity-50 text-sm"
                                >
                                    {forgotSubmitting ? 'Enviando...' : 'Enviar enlace'}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsForgotPassword(false)
                                        setError(null)
                                        setSuccess(null)
                                    }}
                                    className="text-zinc-600 hover:text-zinc-400 text-xs transition-colors duration-200 text-center"
                                >
                                    Volver al login
                                </button>
                            </form>
                        </div>
                    ) : (
                        /* ── Login / Register Form ── */
                        <>
                            <h2 className="text-zinc-200 font-medium text-base mb-5">
                                {isRegister ? 'Crear cuenta' : 'Iniciar sesión'}
                            </h2>

                            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                                <MotionDiv {...formItemProps(0.15)}>
                                    <label className="text-zinc-400 text-xs font-medium mb-1.5 block">Email</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        placeholder="tu@email.com"
                                        className="w-full bg-zinc-800/60 text-zinc-100 rounded-lg px-3.5 py-2.5 border border-zinc-700/60 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 text-sm transition-colors duration-200 placeholder:text-zinc-600"
                                    />
                                </MotionDiv>

                                <MotionDiv {...formItemProps(0.2)}>
                                    <label className="text-zinc-400 text-xs font-medium mb-1.5 block">Contraseña</label>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        placeholder="••••••••"
                                        className="w-full bg-zinc-800/60 text-zinc-100 rounded-lg px-3.5 py-2.5 border border-zinc-700/60 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 text-sm transition-colors duration-200 placeholder:text-zinc-600"
                                    />
                                </MotionDiv>

                                {isRegister && (
                                    <MotionDiv {...formItemProps(0.25)}>
                                        <label className="text-zinc-400 text-xs font-medium mb-1.5 block">Confirmar contraseña</label>
                                        <input
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            required={isRegister}
                                            placeholder="••••••••"
                                            className="w-full bg-zinc-800/60 text-zinc-100 rounded-lg px-3.5 py-2.5 border border-zinc-700/60 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 text-sm transition-colors duration-200 placeholder:text-zinc-600"
                                        />
                                    </MotionDiv>
                                )}

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

                                <MotionDiv {...formItemProps(0.25)}>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="w-full bg-emerald-500 text-zinc-950 font-semibold py-2.5 rounded-lg hover:bg-emerald-400 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                                    >
                                        {submitting ? 'Cargando...' : isRegister ? 'Crear cuenta' : 'Entrar'}
                                    </button>
                                </MotionDiv>
                            </form>

                            {!isRegister && (
                                <p className="text-center mt-3">
                                    <button
                                        onClick={() => {
                                            setIsForgotPassword(true)
                                            setError(null)
                                            setSuccess(null)
                                        }}
                                        className="text-zinc-600 hover:text-zinc-400 text-xs transition-colors duration-200"
                                    >
                                        ¿Olvidaste tu contraseña?
                                    </button>
                                </p>
                            )}

                            <p className="text-center text-zinc-600 text-sm mt-4">
                                {isRegister ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'}{' '}
                                <button
                                    onClick={() => {
                                        setIsRegister(!isRegister)
                                        setError(null)
                                        setSuccess(null)
                                    }}
                                    className="text-zinc-300 hover:text-emerald-400 transition-colors duration-200 font-medium"
                                >
                                    {isRegister ? 'Inicia sesión' : 'Regístrate'}
                                </button>
                            </p>
                        </>
                    )}
                </MotionDiv>

            </div>
        </div>
    )
}

export default Login