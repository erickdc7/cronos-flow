import { useState, useRef, useEffect } from 'react'
import { DayPicker } from 'react-day-picker'
import 'react-day-picker/style.css'
import { CalendarDays, ChevronDown, Check } from 'lucide-react'

const SCHEDULE_OPTIONS = [
    { value: 'daily', label: 'Diaria' },
    { value: 'weekdays', label: 'Lun - Vie' },
    { value: 'mon-wed-fri', label: 'Lun - Mié - Vie' },
    { value: 'tue-thu', label: 'Mar - Jue' },
    { value: 'weekends', label: 'Sáb - Dom' },
    { value: 'specific', label: 'Día específico' },
]

// Check if a schedule value is a specific date
export const isSpecificDate = (schedule) => /^\d{4}-\d{2}-\d{2}$/.test(schedule)

// Format date as DD/MM/YYYY for display
const formatDateDisplay = (dateStr) => {
    if (!dateStr) return ''
    const [y, m, d] = dateStr.split('-')
    return `${d}/${m}/${y}`
}

// Parse DD/MM/YYYY to YYYY-MM-DD
const parseDateInput = (input) => {
    const match = input.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
    if (!match) return null
    const [, d, m, y] = match
    const date = new Date(`${y}-${m}-${d}T00:00:00`)
    if (isNaN(date.getTime())) return null
    if (date.getDate() !== parseInt(d) || date.getMonth() + 1 !== parseInt(m)) return null
    return `${y}-${m}-${d}`
}

// Get today as YYYY-MM-DD
const getTodayStr = () => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

// Get today formatted as DD/MM/YYYY for placeholder
const getTodayPlaceholder = () => formatDateDisplay(getTodayStr())

// Get the schedule label for display
export const getScheduleLabel = (schedule) => {
    if (!schedule || schedule === 'daily') return 'Diaria'
    const option = SCHEDULE_OPTIONS.find(o => o.value === schedule)
    if (option) return option.label
    if (isSpecificDate(schedule)) return formatDateDisplay(schedule)
    return schedule
}

const FrequencySelector = ({ value = 'daily', onChange, specificOnly = false }) => {
    // Internal state to track "specific" mode even before a date is chosen
    const [mode, setMode] = useState(specificOnly ? 'specific' : (isSpecificDate(value) ? 'specific' : value))
    const dateValue = isSpecificDate(value) ? value : ''

    const [dropdownOpen, setDropdownOpen] = useState(false)
    const [showCalendar, setShowCalendar] = useState(false)
    const [dateInput, setDateInput] = useState(dateValue ? formatDateDisplay(dateValue) : '')
    const [dateError, setDateError] = useState(false)

    const dropdownRef = useRef(null)
    const calendarRef = useRef(null)

    // Sync mode when value changes externally
    useEffect(() => {
        setMode(isSpecificDate(value) ? 'specific' : value)
        if (isSpecificDate(value)) {
            setDateInput(formatDateDisplay(value))
        }
    }, [value])

    // Close dropdown on outside click
    useEffect(() => {
        const handleClick = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false)
            }
            if (calendarRef.current && !calendarRef.current.contains(e.target)) {
                setShowCalendar(false)
            }
        }
        document.addEventListener('mousedown', handleClick)
        return () => document.removeEventListener('mousedown', handleClick)
    }, [])

    const handleOptionSelect = (optionValue) => {
        setDropdownOpen(false)
        if (optionValue === 'specific') {
            setMode('specific')
            setDateInput('')
            setDateError(false)
            // Don't call onChange yet — wait for valid date
        } else {
            setMode(optionValue)
            onChange(optionValue)
        }
    }

    const handleDateInputChange = (e) => {
        const raw = e.target.value
        setDateInput(raw)
        setDateError(false)

        const parsed = parseDateInput(raw)
        if (parsed) {
            if (parsed >= getTodayStr()) {
                onChange(parsed)
                setDateError(false)
            } else {
                setDateError(true)
            }
        }
    }

    const handleDateInputBlur = () => {
        if (dateInput && !parseDateInput(dateInput)) {
            setDateError(true)
        } else if (dateInput) {
            const parsed = parseDateInput(dateInput)
            if (parsed && parsed < getTodayStr()) {
                setDateError(true)
            }
        }
    }

    const handleCalendarSelect = (date) => {
        if (!date) return
        const y = date.getFullYear()
        const m = String(date.getMonth() + 1).padStart(2, '0')
        const d = String(date.getDate()).padStart(2, '0')
        const dateStr = `${y}-${m}-${d}`
        setDateInput(formatDateDisplay(dateStr))
        setDateError(false)
        onChange(dateStr)
        setShowCalendar(false)
    }

    const todayDate = new Date(getTodayStr() + 'T00:00:00')
    const selectedCalendarDate = isSpecificDate(value) ? new Date(value + 'T00:00:00') : undefined

    // Current displayed label — always show "Día específico" when in specific mode
    const currentLabel = mode === 'specific'
        ? 'Día específico'
        : (SCHEDULE_OPTIONS.find(o => o.value === mode)?.label || 'Diaria')

    return (
        <div className="flex flex-col gap-[var(--space-2)]">
            {!specificOnly && (
                <label className="text-[var(--color-text-muted)] text-xs font-medium">
                    Frecuencia
                </label>
            )}

            {/* Custom Dropdown — hidden in specificOnly mode */}
            {!specificOnly && (
                <div className="relative" ref={dropdownRef}>
                    <button
                        type="button"
                        onClick={() => setDropdownOpen(prev => !prev)}
                        className={`
                            no-press w-full flex items-center justify-between bg-[var(--color-bg-input)] text-[var(--color-text-primary)] rounded-[var(--radius-lg)] px-[var(--space-3-5)] py-[var(--space-2-5)] border text-sm transition-colors-base text-left
                            ${dropdownOpen
                                ? 'border-[var(--color-border-focus)] ring-1 ring-[var(--color-accent-ring)]'
                                : 'border-[var(--color-border)] hover:border-[var(--color-border-focus)]'
                            }
                        `}
                    >
                        <span>{currentLabel}</span>
                        <ChevronDown className={`w-3.5 h-3.5 text-[var(--color-text-disabled)] transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} strokeWidth={2} />
                    </button>

                    {/* Dropdown menu */}
                    {dropdownOpen && (
                        <div className="absolute z-50 mt-[var(--space-1)] w-full bg-[var(--color-zinc-900)] border border-[var(--color-border)] rounded-[var(--radius-lg)] shadow-2xl overflow-hidden">
                            {SCHEDULE_OPTIONS.map((opt) => {
                                const isActive = mode === opt.value || (opt.value === 'specific' && mode === 'specific')
                                return (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() => handleOptionSelect(opt.value)}
                                        className={`
                                            w-full flex items-center justify-between px-[var(--space-3-5)] py-[var(--space-2-5)] text-sm transition-colors duration-150 text-left
                                            ${isActive
                                                ? 'bg-[var(--color-accent-bg)] text-[var(--color-accent-text)]'
                                                : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-surface)] hover:text-[var(--color-text-primary)]'
                                            }
                                        `}
                                    >
                                        <span>{opt.label}</span>
                                        {isActive && <Check className="w-3.5 h-3.5" strokeWidth={2} />}
                                    </button>
                                )
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* Date picker (only when 'specific' mode) */}
            {mode === 'specific' && (
                <div className="flex flex-col gap-[var(--space-2)]" ref={calendarRef}>
                    <div className="relative">
                        <input
                            type="text"
                            value={dateInput}
                            onChange={handleDateInputChange}
                            onBlur={handleDateInputBlur}
                            placeholder={getTodayPlaceholder()}
                            maxLength={10}
                            className={`w-full bg-[var(--color-bg-input)] text-[var(--color-text-primary)] rounded-[var(--radius-lg)] px-[var(--space-3-5)] py-[var(--space-2-5)] border text-sm transition-colors-base placeholder:text-[var(--color-text-placeholder)] pr-10
                                ${dateError
                                    ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500/30'
                                    : 'border-[var(--color-border)] focus:border-[var(--color-border-focus)] focus:ring-1 focus:ring-[var(--color-accent-ring)]'
                                }
                                focus:outline-none
                            `}
                        />
                        <button
                            type="button"
                            onClick={() => setShowCalendar(prev => !prev)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-[var(--color-text-disabled)] hover:text-[var(--color-text-tertiary)] transition-colors-base rounded-[var(--radius-md)]"
                        >
                            <CalendarDays className="w-4 h-4" strokeWidth={1.5} />
                        </button>
                    </div>

                    {dateError && (
                        <p className="text-red-400 text-[11px]">
                            Ingresa una fecha válida (DD/MM/AAAA) que no sea pasada
                        </p>
                    )}

                    {showCalendar && (
                        <div className="rdp-cronos-wrapper bg-[var(--color-zinc-900)] border border-[var(--color-border)] rounded-[var(--radius-xl)] p-[var(--space-3)] shadow-2xl w-fit">
                            <DayPicker
                                mode="single"
                                selected={selectedCalendarDate}
                                onSelect={handleCalendarSelect}
                                disabled={{ before: todayDate }}
                                showOutsideDays
                            />
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default FrequencySelector
