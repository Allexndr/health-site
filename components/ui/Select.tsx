<<<<<<< HEAD
import { forwardRef, ReactNode } from 'react'
=======
import { forwardRef } from 'react'
import { Listbox } from '@headlessui/react'
import { ChevronUpDownIcon } from '@heroicons/react/24/outline'
>>>>>>> 2c0f3f7c8d961fd85f95a431fb293f616442832a
import { cn } from '@/lib/utils'

export interface SelectOption {
  value: string
  label: string
}

export interface SelectProps {
<<<<<<< HEAD
  options?: SelectOption[]
=======
  options: SelectOption[]
>>>>>>> 2c0f3f7c8d961fd85f95a431fb293f616442832a
  value: string
  onChange: (value: string) => void
  placeholder?: string
  error?: string
  className?: string
  disabled?: boolean
<<<<<<< HEAD
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
=======
}

const Select = forwardRef<HTMLButtonElement, SelectProps>(
  ({ options, value, onChange, placeholder, error, className, disabled }, ref) => {
    const selectedOption = options.find(option => option.value === value)

    return (
      <div className="relative">
        <Listbox value={value} onChange={onChange} disabled={disabled}>
          <div className="relative">
            <Listbox.Button
              ref={ref}
              className={cn(
                'relative w-full cursor-default rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-left shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 sm:text-sm',
                error && 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500',
                disabled && 'cursor-not-allowed bg-gray-50',
                className
              )}
            >
              <span className="block truncate">
                {selectedOption ? selectedOption.label : placeholder}
              </span>
              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                <ChevronUpDownIcon
                  className="h-5 w-5 text-gray-400"
                  aria-hidden="true"
                />
              </span>
            </Listbox.Button>

            <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
              {options.map((option) => (
                <Listbox.Option
                  key={option.value}
                  value={option.value}
                  className={({ active }) =>
                    cn(
                      'relative cursor-default select-none py-2 pl-3 pr-9',
                      active ? 'bg-primary-100 text-primary-900' : 'text-gray-900'
                    )
                  }
                >
                  {({ selected, active }) => (
                    <>
                      <span
                        className={cn(
                          'block truncate',
                          selected ? 'font-semibold' : 'font-normal'
                        )}
                      >
                        {option.label}
                      </span>
                    </>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </div>
        </Listbox>
        {error && (
          <p className="mt-2 text-sm text-red-600" id="email-error">
            {error}
          </p>
>>>>>>> 2c0f3f7c8d961fd85f95a431fb293f616442832a
        )}
      </div>
    )
  }
)

Select.displayName = 'Select'

<<<<<<< HEAD
export default Select 
=======
export { Select } 
>>>>>>> 2c0f3f7c8d961fd85f95a431fb293f616442832a
