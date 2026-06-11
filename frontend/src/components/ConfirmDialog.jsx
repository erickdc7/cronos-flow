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
                        className="fixed inset-0 bg-zinc-950/80 backdrop-blur-sm z-50"
                        onClick={onClose}
                    />
                    
                    {/* Dialog */}
                    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 8 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 8 }}
                            transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
                            className="bg-zinc-900/90 border border-zinc-800/60 rounded-xl p-6 w-full max-w-sm shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Icon */}
                            <div className="flex justify-center mb-4">
                                <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                                    <AlertTriangle className="w-7 h-7 text-red-400" strokeWidth={1.5} />
                                </div>
                            </div>
                            
                            {/* Content */}
                            <div className="text-center mb-6">
                                <h3 className="text-zinc-100 font-semibold text-lg mb-2">
                                    {title}
                                </h3>
                                <p className="text-zinc-400 text-sm">
                                    {message}
                                </p>
                            </div>
                            
                            {/* Buttons */}
                            <div className="flex gap-3">
                                <button
                                    onClick={onClose}
                                    className="flex-1 text-zinc-400 hover:text-zinc-200 text-sm font-medium px-4 py-2.5 rounded-lg border border-zinc-700/60 hover:bg-zinc-800/60 transition-colors duration-200"
                                >
                                    {cancelText}
                                </button>
                                <button
                                    onClick={onConfirm}
                                    className="flex-1 bg-red-500 hover:bg-red-400 text-zinc-950 text-sm font-medium px-4 py-2.5 rounded-lg transition-colors duration-200"
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
