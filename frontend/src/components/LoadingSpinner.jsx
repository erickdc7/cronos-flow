import { Loader2 } from 'lucide-react'

const LoadingSpinner = ({ message = 'Cargando...', size = 'default' }) => {
    const sizeClasses = {
        small: 'w-4 h-4',
        default: 'w-5 h-5',
        large: 'w-8 h-8'
    }

    return (
        <div className="flex flex-col items-center justify-center gap-3 py-8">
            <Loader2
                className={`${sizeClasses[size]} text-emerald-400 animate-spin-smooth`}
                strokeWidth={2}
            />
            {message && (
                <p className="text-zinc-500 text-sm">{message}</p>
            )}
        </div>
    )
}

export default LoadingSpinner
