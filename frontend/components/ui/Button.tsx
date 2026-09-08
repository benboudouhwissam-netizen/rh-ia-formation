'use client';

import type { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonColor = 'sauge' | 'alerte' | 'ardoise';
type ButtonVariant = 'primary' | 'danger' | 'secondary' | 'tertiary' | 'ai-suggestion';

export interface ButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'color' | 'children'> {
  variant?: ButtonVariant;
  color?: ButtonColor;
  children: ReactNode;
  icon?: ReactNode;
  loading?: boolean;
  ariaLabel?: string;
}

const filledStyles: Record<ButtonColor, string> = {
  sauge: 'bg-sauge text-brume hover:bg-sauge/90 focus-visible:ring-sauge',
  alerte: 'bg-alerte text-brume hover:bg-alerte/90 focus-visible:ring-alerte',
  ardoise: 'bg-ardoise text-brume hover:bg-ardoise/90 focus-visible:ring-ardoise',
};

const outlineStyles: Record<ButtonColor, string> = {
  sauge:
    'bg-transparent text-sauge border border-sauge/40 hover:bg-sauge/8 focus-visible:ring-sauge',
  alerte:
    'bg-transparent text-alerte border border-alerte/40 hover:bg-alerte/8 focus-visible:ring-alerte',
  ardoise:
    'bg-transparent text-encre border border-ardoise/40 hover:bg-ardoise/8 focus-visible:ring-ardoise',
};

const textStyles: Record<ButtonColor, string> = {
  sauge: 'bg-transparent text-sauge hover:bg-sauge/8 focus-visible:ring-sauge',
  alerte: 'bg-transparent text-alerte hover:bg-alerte/8 focus-visible:ring-alerte',
  ardoise: 'bg-transparent text-ardoise hover:bg-ardoise/8 focus-visible:ring-ardoise',
};

type FilledVariant = Exclude<ButtonVariant, 'ai-suggestion'>;

const variantConfig: Record<
  FilledVariant,
  { shape: Record<ButtonColor, string>; defaultColor: ButtonColor }
> = {
  primary: { shape: filledStyles, defaultColor: 'sauge' },
  danger: { shape: filledStyles, defaultColor: 'alerte' },
  secondary: { shape: outlineStyles, defaultColor: 'ardoise' },
  tertiary: { shape: textStyles, defaultColor: 'ardoise' },
};

const aiSuggestionStyles =
  'bg-ocre/5 text-encre border-l-4 border-dashed border-ocre hover:bg-ocre/10 focus-visible:ring-ocre';

const baseStyles =
  'inline-flex items-center gap-2 rounded-lg font-body text-body px-4 py-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-40 disabled:cursor-not-allowed';

function InlineSpinner() {
  return (
    <svg
      className="h-4 w-4 animate-spin motion-reduce:animate-none"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  );
}

export default function Button({
  variant = 'primary',
  color,
  children,
  icon,
  disabled = false,
  loading = false,
  onClick,
  type = 'button',
  ariaLabel,
  ...props
}: ButtonProps) {
  if (variant === 'ai-suggestion') {
    return (
      <button
        type={type}
        disabled={disabled}
        onClick={onClick}
        aria-label={ariaLabel}
        className={`${baseStyles} ${aiSuggestionStyles}`}
        {...props}
      >
        {loading ? <InlineSpinner /> : icon}
        {children}
      </button>
    );
  }

  const config = variantConfig[variant];
  const resolvedColor = color || config.defaultColor;
  const colorStyles = config.shape[resolvedColor] || config.shape[config.defaultColor];

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      aria-label={ariaLabel}
      className={`${baseStyles} ${colorStyles}`}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}