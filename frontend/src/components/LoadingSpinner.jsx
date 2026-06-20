import { Loader2 } from 'lucide-react'

const LoadingSpinner = ({ message = 'Cargando...', size = 'default' }) => {
    const sizeClasses = {
        small: 'w-4 h-4',
        default: 'w-5 h-5',
        large: 'w-8 h-8'
    }

    return (
        <div className="flex flex-col items-center justify-center gap-[var(--space-3)] py-[var(--space-8)]">
            <Loader2
                className={`${sizeClasses[size]} text-[var(--color-accent-subtle)] animate-spin-smooth`}
                strokeWidth={2}
            />
            {message && (
                <p className="text-[var(--color-text-disabled)] text-sm">{message}</p>
            )}
        </div>
    )
}

export default LoadingSpinner
