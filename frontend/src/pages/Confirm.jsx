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
                </MotionDiv>

                {/* Status Card */}
                <MotionDiv
                    className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl p-8 text-center"
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
                            <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                                <CheckCircle2 className="w-7 h-7 text-emerald-400" strokeWidth={1.5} />
                            </div>
                            <div>
                                <h2 className="text-zinc-100 font-semibold text-lg mb-2">
                                    ¡Email confirmado!
                                </h2>
                                <p className="text-zinc-500 text-sm">
                                    Tu cuenta está lista. Redirigiendo al login...
                                </p>
                            </div>
                            <div className="w-full bg-zinc-800/80 rounded-full h-1 overflow-hidden mt-2">
                                <motion.div
                                    className="bg-emerald-500 h-1 rounded-full"
                                    initial={{ width: '0%' }}
                                    animate={{ width: '100%' }}
                                    transition={{ duration: 3, ease: 'linear' }}
                                />
                            </div>
                        </div>
                    )}

                    {status === 'error' && (
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                                <XCircle className="w-7 h-7 text-red-400" strokeWidth={1.5} />
                            </div>
                            <div>
                                <h2 className="text-zinc-100 font-semibold text-lg mb-2">
                                    Enlace inválido
                                </h2>
                                <p className="text-zinc-500 text-sm mb-4">
                                    El enlace expiró o ya fue usado.
                                </p>
                            </div>
                            <button
                                onClick={() => navigate('/login')}
                                className="text-emerald-400 hover:text-emerald-300 text-sm transition-colors duration-200"
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