import { useState, useEffect } from 'react'
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
    const [justRegistered, setJustRegistered] = useState(false)
    const [emailConfirmed, setEmailConfirmed] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [isForgotPassword, setIsForgotPassword] = useState(false)
    const [forgotEmail, setForgotEmail] = useState('')
    const [forgotSubmitting, setForgotSubmitting] = useState(false)
    const shouldReduceMotion = useReducedMotion()

    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
            if (event === 'SIGNED_IN' && justRegistered) {
                setEmailConfirmed(true)
            }
        })
        return () => subscription.unsubscribe()
    }, [justRegistered])

    if (loading) {
        return (
            <div className="min-h-[100dvh] flex items-center justify-center bg-[var(--color-bg)]">
                <LoadingSpinner message="Cargando..." />
            </div>
        )
    }

    if (user && !justRegistered && !emailConfirmed) return <Navigate to="/" replace />

    if (emailConfirmed) return (
        <div className="min-h-[100dvh] bg-[var(--color-bg)] flex items-center justify-center px-[var(--space-4)]">
            <div className="w-full max-w-sm text-center">
                <div className="w-14 h-14 rounded-[var(--radius-2xl)] bg-[var(--color-accent-bg)] border border-[var(--color-accent-border)] flex items-center justify-center mb-[var(--space-4)] mx-auto">
                    <Timer className="w-7 h-7 text-[var(--color-accent-text)]" strokeWidth={1.5} />
                </div>
                <h1 className="text-xl font-semibold text-[var(--color-text-primary)] tracking-tight mb-[var(--space-2)]">Cronos Flow</h1>
                <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-[var(--radius-xl)] p-[var(--space-6)] mt-[var(--space-6)]">
                    <CheckCircle2 className="w-10 h-10 text-[var(--color-accent-text)] mx-auto mb-[var(--space-3)]" strokeWidth={1.5} />
                    <h2 className="text-[var(--color-text-primary)] font-semibold text-base mb-[var(--space-2)]">¡Cuenta confirmada!</h2>
                    <p className="text-[var(--color-text-disabled)] text-sm mb-[var(--space-4)]">Tu email fue verificado correctamente.</p>
                    <button
                        onClick={() => {
                            setJustRegistered(false)
                            setEmailConfirmed(false)
                            setSuccess(null)
                            supabase.auth.signOut()
                        }}
                        className="w-full bg-[var(--color-accent)] text-[var(--color-zinc-950)] font-semibold py-[var(--space-2-5)] rounded-[var(--radius-lg)] hover:bg-[var(--color-accent-hover)] transition-colors duration-[var(--transition-base)] text-sm"
                    >
                        Ir al login
                    </button>
                </div>
            </div>
        </div>
    )

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
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        emailRedirectTo: 'https://cronos-flow-notes.vercel.app/confirm'
                    }
                })
                if (error) throw error
                setSuccess('Cuenta creada. Revisa tu email para confirmar.')
                setJustRegistered(true)
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

    const handleGuestLogin = async () => {
        setError(null)
        setSubmitting(true)
        try {
            const { error } = await supabase.auth.signInAnonymously()
            if (error) throw error
        } catch (err) {
            setError(err.message)
        } finally {
            setSubmitting(false)
        }
    }

    const MotionDiv = shouldReduceMotion ? 'div' : motion.div

    const formItemProps = (delay) => shouldReduceMotion ? {} : {
        initial: { opacity: 0, y: 12 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.4, delay, ease: [0.23, 1, 0.32, 1] }
    }



    return (
        <div className="min-h-[100dvh] bg-[var(--color-bg)] flex items-center justify-center px-[var(--space-4)]">
            <div className="w-full max-w-sm">

                {/* Brand Mark */}
                <MotionDiv
                    className="flex flex-col items-center mb-[var(--space-8)]"
                    {...(shouldReduceMotion ? {} : {
                        initial: { opacity: 0, y: -8 },
                        animate: { opacity: 1, y: 0 },
                        transition: { duration: 0.5, ease: [0.23, 1, 0.32, 1] }
                    })}
                >
                    <div className="w-14 h-14 rounded-[var(--radius-2xl)] bg-[var(--color-accent-bg)] border border-[var(--color-accent-border)] flex items-center justify-center mb-[var(--space-4)]">
                        <Timer className="w-7 h-7 text-[var(--color-accent-text)]" strokeWidth={1.5} />
                    </div>
                    <h1 className="text-xl font-semibold text-[var(--color-text-primary)] tracking-tight">Cronos Flow</h1>
                    <p className="text-[var(--color-text-disabled)] text-sm mt-[var(--space-1)]">Tu registro diario de actividades</p>
                </MotionDiv>

                {/* Form Card */}
                <MotionDiv
                    className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-[var(--radius-xl)] p-[var(--space-6)]"
                    {...(shouldReduceMotion ? {} : {
                        initial: { opacity: 0, y: 16 },
                        animate: { opacity: 1, y: 0 },
                        transition: { duration: 0.5, delay: 0.1, ease: [0.23, 1, 0.32, 1] }
                    })}
                >
                    {isForgotPassword ? (
                        /* ── Forgot Password Form ── */
                        <div>
                            <h2 className="text-[var(--color-text-secondary)] font-medium text-base mb-[var(--space-5)]">Restablecer contraseña</h2>
                            <form onSubmit={handleForgotPassword} className="flex flex-col gap-[var(--space-4)]">
                                <div>
                                    <label className="text-[var(--color-text-muted)] text-xs font-medium mb-[var(--space-1-5)] block">Email</label>
                                    <input
                                        type="email"
                                        value={forgotEmail}
                                        onChange={(e) => setForgotEmail(e.target.value)}
                                        required
                                        placeholder="tu@email.com"
                                        autoFocus
                                        className="w-full bg-[var(--color-bg-input)] text-[var(--color-text-primary)] rounded-[var(--radius-lg)] px-[var(--space-3-5)] py-[var(--space-2-5)] border border-[var(--color-border)] focus:outline-none focus:border-[var(--color-border-focus)] focus:ring-1 focus:ring-[var(--color-accent-ring)] text-sm transition-colors duration-[var(--transition-base)] placeholder:text-[var(--color-text-placeholder)]"
                                    />
                                </div>

                                {error && (
                                    <div className="flex items-start gap-[var(--space-2)] text-[var(--color-error)] text-sm bg-[var(--color-error-bg)] border border-[var(--color-error-border)] px-[var(--space-3-5)] py-[var(--space-2-5)] rounded-[var(--radius-lg)]">
                                        <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" strokeWidth={2} />
                                        <span>{error}</span>
                                    </div>
                                )}

                                {success && (
                                    <div className="flex items-start gap-[var(--space-2)] text-[var(--color-accent-text)] text-sm bg-[var(--color-success-bg)] border border-[var(--color-success-border)] px-[var(--space-3-5)] py-[var(--space-2-5)] rounded-[var(--radius-lg)]">
                                        <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" strokeWidth={2} />
                                        <span>{success}</span>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={forgotSubmitting}
                                    className="w-full bg-[var(--color-accent)] text-[var(--color-zinc-950)] font-semibold py-[var(--space-2-5)] rounded-[var(--radius-lg)] hover:bg-[var(--color-accent-hover)] transition-colors duration-[var(--transition-base)] disabled:opacity-50 text-sm"
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
                                    className="text-[var(--color-text-disabled)] hover:text-[var(--color-text-muted)] text-xs transition-colors duration-[var(--transition-base)] text-center"
                                >
                                    Volver al login
                                </button>
                            </form>
                        </div>
                    ) : (
                        /* ── Login / Register Form ── */
                        <>
                            <h2 className="text-[var(--color-text-secondary)] font-medium text-base mb-[var(--space-5)]">
                                {isRegister ? 'Crear cuenta' : 'Iniciar sesión'}
                            </h2>

                            <form onSubmit={handleSubmit} className="flex flex-col gap-[var(--space-4)]">
                                <MotionDiv {...formItemProps(0.15)}>
                                    <label className="text-[var(--color-text-muted)] text-xs font-medium mb-[var(--space-1-5)] block">Email</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        placeholder="tu@email.com"
                                        className="w-full bg-[var(--color-bg-input)] text-[var(--color-text-primary)] rounded-[var(--radius-lg)] px-[var(--space-3-5)] py-[var(--space-2-5)] border border-[var(--color-border)] focus:outline-none focus:border-[var(--color-border-focus)] focus:ring-1 focus:ring-[var(--color-accent-ring)] text-sm transition-colors duration-[var(--transition-base)] placeholder:text-[var(--color-text-placeholder)]"
                                    />
                                </MotionDiv>

                                <MotionDiv {...formItemProps(0.2)}>
                                    <label className="text-[var(--color-text-muted)] text-xs font-medium mb-[var(--space-1-5)] block">Contraseña</label>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        placeholder="••••••••"
                                        className="w-full bg-[var(--color-bg-input)] text-[var(--color-text-primary)] rounded-[var(--radius-lg)] px-[var(--space-3-5)] py-[var(--space-2-5)] border border-[var(--color-border)] focus:outline-none focus:border-[var(--color-border-focus)] focus:ring-1 focus:ring-[var(--color-accent-ring)] text-sm transition-colors duration-[var(--transition-base)] placeholder:text-[var(--color-text-placeholder)]"
                                    />
                                </MotionDiv>

                                {isRegister && (
                                    <MotionDiv {...formItemProps(0.25)}>
                                        <label className="text-[var(--color-text-muted)] text-xs font-medium mb-[var(--space-1-5)] block">Confirmar contraseña</label>
                                        <input
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            required={isRegister}
                                            placeholder="••••••••"
                                            className="w-full bg-[var(--color-bg-input)] text-[var(--color-text-primary)] rounded-[var(--radius-lg)] px-[var(--space-3-5)] py-[var(--space-2-5)] border border-[var(--color-border)] focus:outline-none focus:border-[var(--color-border-focus)] focus:ring-1 focus:ring-[var(--color-accent-ring)] text-sm transition-colors duration-[var(--transition-base)] placeholder:text-[var(--color-text-placeholder)]"
                                        />
                                    </MotionDiv>
                                )}

                                {error && (
                                    <div className="flex items-start gap-[var(--space-2)] text-[var(--color-error)] text-sm bg-[var(--color-error-bg)] border border-[var(--color-error-border)] px-[var(--space-3-5)] py-[var(--space-2-5)] rounded-[var(--radius-lg)]">
                                        <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" strokeWidth={2} />
                                        <span>{error}</span>
                                    </div>
                                )}

                                {success && (
                                    <div className="flex items-start gap-[var(--space-2)] text-[var(--color-accent-text)] text-sm bg-[var(--color-success-bg)] border border-[var(--color-success-border)] px-[var(--space-3-5)] py-[var(--space-2-5)] rounded-[var(--radius-lg)]">
                                        <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" strokeWidth={2} />
                                        <span>{success}</span>
                                    </div>
                                )}

                                <MotionDiv {...formItemProps(0.25)}>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="w-full bg-[var(--color-accent)] text-[var(--color-zinc-950)] font-semibold py-[var(--space-2-5)] rounded-[var(--radius-lg)] hover:bg-[var(--color-accent-hover)] transition-colors duration-[var(--transition-base)] disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                                    >
                                        {submitting ? 'Cargando...' : isRegister ? 'Crear cuenta' : 'Entrar'}
                                    </button>
                                </MotionDiv>
                            </form>

                            {!isRegister && (
                                <p className="text-center mt-[var(--space-3)]">
                                    <button
                                        onClick={() => {
                                            setIsForgotPassword(true)
                                            setError(null)
                                            setSuccess(null)
                                        }}
                                        className="text-[var(--color-text-disabled)] hover:text-[var(--color-text-muted)] text-xs transition-colors duration-[var(--transition-base)]"
                                    >
                                        ¿Olvidaste tu contraseña?
                                    </button>
                                </p>
                            )}

                            <p className="text-center text-[var(--color-text-disabled)] text-sm mt-[var(--space-4)]">
                                {isRegister ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'}{' '}
                                <button
                                    onClick={() => {
                                        setIsRegister(!isRegister)
                                        setError(null)
                                        setSuccess(null)
                                    }}
                                    className="text-[var(--color-text-tertiary)] hover:text-[var(--color-accent-subtle)] transition-colors duration-[var(--transition-base)] font-medium"
                                >
                                    {isRegister ? 'Inicia sesión' : 'Regístrate'}
                                </button>
                            </p>

                            {!isRegister && (
                                <div className="mt-[var(--space-5)] pt-[var(--space-5)] border-t border-[var(--color-border)]">
                                    <button
                                        onClick={handleGuestLogin}
                                        disabled={submitting}
                                        className="w-full text-[var(--color-text-disabled)] hover:text-[var(--color-text-tertiary)] border border-[var(--color-zinc-800)] hover:border-[var(--color-border-hover)] rounded-[var(--radius-lg)] py-[var(--space-2-5)] text-sm transition-colors duration-[var(--transition-base)] disabled:opacity-50"
                                    >
                                        Probar sin cuenta
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </MotionDiv>

            </div>
        </div>
    )
}

export default Login