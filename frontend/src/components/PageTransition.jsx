import { motion, useReducedMotion } from 'motion/react'

const PageTransition = ({ children }) => {
    const shouldReduceMotion = useReducedMotion()

    if (shouldReduceMotion) {
        return <>{children}</>
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
                duration: 0.35,
                ease: [0.23, 1, 0.32, 1]
            }}
        >
            {children}
        </motion.div>
    )
}

export default PageTransition
