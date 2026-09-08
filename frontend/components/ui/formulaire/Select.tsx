'use client';

import { useId, SelectHTMLAttributes } from 'react';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'value'> {
  name?: string;
  label: string;
  error?: string;
  required?: boolean;
  options?: SelectOption[];
  className?: string;
  value?: string;
}

export default function Select({
  name,
  label,
  error,
  required = false,
  options = [],
  className = '',
  ...props
}: SelectProps) {
  const fieldId = useId();
  const errorId = `${fieldId}-error`;

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={fieldId} className="font-body text-caption font-medium text-encre">
        {label}
        {required && <span className="ml-1 text-alerte">*</span>}
      </label>
      <select
        id={fieldId}
        name={name}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
        className={`w-full rounded-lg border bg-white px-2 py-1 font-body text-body text-encre transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sauge ${
          error ? 'border-alerte' : 'border-ardoise/40'
        } ${className}`}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p id={errorId} className="font-body text-caption text-alerte">
          {error}
        </p>
      )}
    </div>
  );
}