const EmptyState = ({ icon: Icon, title, description, action }) => {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-4">
            {Icon && (
                <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-zinc-600" strokeWidth={1.5} />
                </div>
            )}
            <p className="text-zinc-400 text-sm font-medium mb-1">{title}</p>
            {description && (
                <p className="text-zinc-600 text-xs text-center max-w-[280px]">{description}</p>
            )}
            {action && (
                <div className="mt-4">
                    {action}
                </div>
            )}
        </div>
    )
}

export default EmptyState
