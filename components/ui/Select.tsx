import { forwardRef, ReactNode } from 'react'
import { cn } from '@/lib/utils'

export interface SelectOption {
  value: string
  label: string
}

export interface SelectProps {
  options?: SelectOption[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  error?: string
  className?: string
  disabled?: boolean
  children?: ReactNode
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ options, value, onChange, placeholder, error, className, disabled, children }, ref) => {
    
    // Если переданы children, используем их (HTML option элементы)
    if (children) {
      return (
        <div className="relative">
          <select
            ref={ref}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            className={cn(
              'relative w-full cursor-default rounded-md border border-gray-300 bg-white py-2 pl-3 pr-8 text-left shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm',
              error && 'border-red-300 text-red-900 focus:border-red-500 focus:ring-red-500',
              disabled && 'cursor-not-allowed bg-gray-50',
              className
            )}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {children}
          </select>
          {error && (
            <p className="mt-1 text-sm text-red-600">{error}</p>
          )}
        </div>
      )
    }

    // Если переданы options как массив объектов
    if (options) {
      const selectedOption = options.find(option => option.value === value)

      return (
        <div className="relative">
          <select
            ref={ref}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            className={cn(
              'relative w-full cursor-default rounded-md border border-gray-300 bg-white py-2 pl-3 pr-8 text-left shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm',
              error && 'border-red-300 text-red-900 focus:border-red-500 focus:ring-red-500',
              disabled && 'cursor-not-allowed bg-gray-50',
              className
            )}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {error && (
            <p className="mt-1 text-sm text-red-600">{error}</p>
          )}
        </div>
      )
    }

    // Fallback - пустой select
    return (
      <div className="relative">
        <select
          ref={ref}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className={cn(
            'relative w-full cursor-default rounded-md border border-gray-300 bg-white py-2 pl-3 pr-8 text-left shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm',
            error && 'border-red-300 text-red-900 focus:border-red-500 focus:ring-red-500',
            disabled && 'cursor-not-allowed bg-gray-50',
            className
          )}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
        </select>
        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
      </div>
    )
  }
)

Select.displayName = 'Select'

export default Select 