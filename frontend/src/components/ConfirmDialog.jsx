import { motion, AnimatePresence } from 'motion/react'
import { AlertTriangle } from 'lucide-react'

const ConfirmDialog = ({ 
    isOpen, 
    onClose, 
    onConfirm, 
    title = '¿Estás seguro?', 
    message = 'Esta acción no se puede deshacer.',
    confirmText = 'Eliminar',
    cancelText = 'Cancelar'
}) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 bg-[var(--color-zinc-950-80)] backdrop-blur-sm z-50"
                        onClick={onClose}
                    />
                    
                    {/* Dialog */}
                    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 8 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 8 }}
                            transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
                            className="bg-[var(--color-zinc-900-90)] border border-[var(--color-border)] rounded-[var(--radius-xl)] p-[var(--space-6)] w-full max-w-sm shadow-[var(--shadow-2xl)]"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Icon */}
                            <div className="flex justify-center mb-4">
                                <div className="w-14 h-14 rounded-[var(--radius-full)] bg-[var(--color-red-500-10)] border border-[var(--color-red-500-20)] flex items-center justify-center">
                                    <AlertTriangle className="w-7 h-7 text-[var(--color-error)]" strokeWidth={1.5} />
                                </div>
                            </div>
                            
                            {/* Content */}
                            <div className="text-center mb-6">
                                <h3 className="text-[var(--color-text-primary)] font-semibold text-lg mb-[var(--space-2)]">
                                    {title}
                                </h3>
                                <p className="text-[var(--color-text-muted)] text-sm">
                                    {message}
                                </p>
                            </div>
                            
                            {/* Buttons */}
                            <div className="flex gap-3">
                                <button
                                    onClick={onClose}
                                    className="flex-1 text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] text-sm font-medium px-[var(--space-4)] py-[var(--space-2-5)] rounded-[var(--radius-lg)] border border-[var(--color-border)] hover:bg-[var(--color-bg-surface)] transition-colors duration-[var(--transition-base)]"
                                >
                                    {cancelText}
                                </button>
                                <button
                                    onClick={onConfirm}
                                    className="flex-1 bg-[var(--color-red-500)] hover:bg-[var(--color-error-hover)] text-[var(--color-zinc-950)] text-sm font-medium px-[var(--space-4)] py-[var(--space-2-5)] rounded-[var(--radius-lg)] transition-colors duration-[var(--transition-base)]"
                                >
                                    {confirmText}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    )
}

export default ConfirmDialog
