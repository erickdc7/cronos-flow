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
    const [ready, setReady] = useState(false)
    const navigate = useNavigate()
    const shouldReduceMotion = useReducedMotion()

    useEffect(() => {
        // Supabase procesa el hash de la URL automáticamente
        // y dispara PASSWORD_RECOVERY en onAuthStateChange
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if (event === 'PASSWORD_RECOVERY') {
                    setReady(true)
                }
            }
        )

        // También verificar si ya hay sesión activa con recovery
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) {
                setReady(true)
            }
        })

        return () => subscription.unsubscribe()
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
            await supabase.auth.signOut()
            setTimeout(() => navigate('/login'), 2000)
        } catch (err) {
            setError(err.message)
        } finally {
            setSubmitting(false)
        }
    }

    const MotionDiv = shouldReduceMotion ? 'div' : motion.div

    if (!ready) {
        return (
            <div className="min-h-[100dvh] flex items-center justify-center bg-[var(--color-bg)]">
                <LoadingSpinner message="Verificando enlace..." />
            </div>
        )
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
                    <p className="text-[var(--color-text-disabled)] text-sm mt-[var(--space-1)]">Establece tu nueva contraseña</p>
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
                    <h2 className="text-[var(--color-text-secondary)] font-medium text-base mb-[var(--space-5)]">Nueva contraseña</h2>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-[var(--space-4)]">
                        <div>
                            <label className="text-[var(--color-text-muted)] text-xs font-medium mb-[var(--space-1-5)] block">Nueva contraseña</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                autoFocus
                                placeholder="••••••••"
                                className="w-full bg-[var(--color-bg-input)] text-[var(--color-text-primary)] rounded-[var(--radius-lg)] px-[var(--space-3-5)] py-[var(--space-2-5)] border border-[var(--color-border)] focus:outline-none focus:border-[var(--color-border-focus)] focus:ring-1 focus:ring-[var(--color-accent-ring)] text-sm transition-colors duration-[var(--transition-base)] placeholder:text-[var(--color-text-placeholder)]"
                            />
                        </div>

                        <div>
                            <label className="text-[var(--color-text-muted)] text-xs font-medium mb-[var(--space-1-5)] block">Confirmar contraseña</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                placeholder="••••••••"
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
                            disabled={submitting}
                            className="w-full bg-[var(--color-accent)] text-[var(--color-zinc-950)] font-semibold py-[var(--space-2-5)] rounded-[var(--radius-lg)] hover:bg-[var(--color-accent-hover)] transition-colors duration-[var(--transition-base)] disabled:bg-[var(--color-zinc-800-60)] disabled:text-[var(--color-text-disabled-on-bg)] disabled:cursor-not-allowed text-sm"
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