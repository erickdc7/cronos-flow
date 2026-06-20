import { useEffect, useState } from 'react'

const ProgressRing = ({ percentage = 0, size = 80, strokeWidth = 6 }) => {
    const [animatedPercentage, setAnimatedPercentage] = useState(0)
    const radius = (size - strokeWidth) / 2
    const circumference = radius * 2 * Math.PI
    const offset = circumference - (animatedPercentage / 100) * circumference

    useEffect(() => {
        // Animate the percentage on mount and when it changes
        const timer = setTimeout(() => {
            setAnimatedPercentage(percentage)
        }, 100)
        return () => clearTimeout(timer)
    }, [percentage])

    return (
        <div className="relative inline-flex items-center justify-center">
            <svg
                width={size}
                height={size}
                className="-rotate-90"
            >
                {/* Background circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="var(--color-zinc-800)"
                    strokeWidth={strokeWidth}
                />
                {/* Progress circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="var(--color-accent-subtle)"
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    className="transition-all duration-1000 ease-in-out"
                />
            </svg>
            {/* Center text */}
            <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-mono text-sm font-medium text-[var(--color-text-secondary)] tabular-nums">
                    {percentage}%
                </span>
            </div>
        </div>
    )
}

export default ProgressRing
