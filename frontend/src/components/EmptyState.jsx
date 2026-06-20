const EmptyState = ({ icon: Icon, title, description, action }) => {
    return (
        <div className="flex flex-col items-center justify-center py-[var(--space-16)] px-[var(--space-4)]">
            {Icon && (
                <div className="w-12 h-12 rounded-[var(--radius-2xl)] bg-[var(--color-zinc-900)] border border-[var(--color-zinc-800)] flex items-center justify-center mb-[var(--space-4)]">
                    <Icon className="w-6 h-6 text-[var(--color-text-disabled)]" strokeWidth={1.5} />
                </div>
            )}
            <p className="text-[var(--color-text-muted)] text-sm font-medium mb-[var(--space-1)]">{title}</p>
            {description && (
                <p className="text-[var(--color-text-disabled)] text-xs text-center max-w-[280px]">{description}</p>
            )}
            {action && (
                <div className="mt-[var(--space-4)]">
                    {action}
                </div>
            )}
        </div>
    )
}

export default EmptyState
