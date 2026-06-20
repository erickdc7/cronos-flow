import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, useReducedMotion } from 'motion/react'
import { supabase } from '../lib/supabase'
import { Timer, CheckCircle2, XCircle } from 'lucide-react'
import LoadingSpinner from '../components/LoadingSpinner'

const Confirm = () => {
    const [status, setStatus] = useState('loading') // loading | success | error
    const navigate = useNavigate()
    const shouldReduceMotion = useReducedMotion()

    useEffect(() => {
        let redirected = false

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if ((event === 'SIGNED_IN' || event === 'USER_UPDATED') && session && !redirected) {
                    redirected = true
                    await supabase.auth.signOut()
                    setStatus('success')
                    setTimeout(() => navigate('/login'), 3000)
                }
            }
        )

        // Verificar si ya hay sesión activa al cargar
        supabase.auth.getSession().then(async ({ data: { session } }) => {
            if (session && !redirected) {
                redirected = true
                await supabase.auth.signOut()
                setStatus('success')
                setTimeout(() => navigate('/login'), 3000)
            }
        })

        // Timeout más largo y solo si no hubo sesión
        const timeout = setTimeout(() => {
            if (!redirected) setStatus('error')
        }, 8000)

        return () => {
            subscription.unsubscribe()
            clearTimeout(timeout)
        }
    }, [])

    const MotionDiv = shouldReduceMotion ? 'div' : motion.div

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
                </MotionDiv>

                {/* Status Card */}
                <MotionDiv
                    className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-[var(--radius-xl)] p-[var(--space-8)] text-center"
                    {...(shouldReduceMotion ? {} : {
                        initial: { opacity: 0, y: 16 },
                        animate: { opacity: 1, y: 0 },
                        transition: { duration: 0.5, delay: 0.1, ease: [0.23, 1, 0.32, 1] }
                    })}
                >
                    {status === 'loading' && (
                        <div className="flex flex-col items-center gap-4">
                            <LoadingSpinner message="Confirmando tu email..." />
                        </div>
                    )}

                    {status === 'success' && (
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-14 h-14 rounded-[var(--radius-full)] bg-[var(--color-accent-bg)] border border-[var(--color-accent-border)] flex items-center justify-center">
                                <CheckCircle2 className="w-7 h-7 text-[var(--color-accent-text)]" strokeWidth={1.5} />
                            </div>
                            <div>
                                <h2 className="text-[var(--color-text-primary)] font-semibold text-lg mb-[var(--space-2)]">
                                    ¡Email confirmado!
                                </h2>
                                <p className="text-[var(--color-text-disabled)] text-sm">
                                    Tu cuenta está lista. Redirigiendo al login...
                                </p>
                            </div>
                            <div className="w-full bg-[var(--color-zinc-800-80)] rounded-[var(--radius-full)] h-1 overflow-hidden mt-[var(--space-2)]">
                                <motion.div
                                    className="bg-[var(--color-accent)] h-1 rounded-[var(--radius-full)]"
                                    initial={{ width: '0%' }}
                                    animate={{ width: '100%' }}
                                    transition={{ duration: 3, ease: 'linear' }}
                                />
                            </div>
                        </div>
                    )}

                    {status === 'error' && (
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-14 h-14 rounded-[var(--radius-full)] bg-[var(--color-red-500-10)] border border-[var(--color-red-500-20)] flex items-center justify-center">
                                <XCircle className="w-7 h-7 text-[var(--color-error)]" strokeWidth={1.5} />
                            </div>
                            <div>
                                <h2 className="text-[var(--color-text-primary)] font-semibold text-lg mb-[var(--space-2)]">
                                    Enlace inválido
                                </h2>
                                <p className="text-[var(--color-text-disabled)] text-sm mb-[var(--space-4)]">
                                    El enlace expiró o ya fue usado.
                                </p>
                            </div>
                            <button
                                onClick={() => navigate('/login')}
                                className="text-[var(--color-accent-text)] hover:text-[var(--color-accent-text-hover)] text-sm transition-colors duration-[var(--transition-base)]"
                            >
                                Volver al login
                            </button>
                        </div>
                    )}
                </MotionDiv>

            </div>
        </div>
    )
}

export default Confirm