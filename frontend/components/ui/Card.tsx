import type { ReactNode } from 'react';

type CardVariant = 'default' | 'ai';

export interface CardProps {
  children: ReactNode;
  variant?: CardVariant;
  className?: string;
}

const baseStyles = 'rounded-lg border border-ardoise/12 p-2 tablet:p-3 bg-white';

const variantStyles: Record<CardVariant, string> = {
  default: '',
  ai: 'bg-ocre/5 border-l-4 border-dashed border-ocre',
};

export default function Card({ children, variant = 'default', className = '' }: CardProps) {
  return (
    <div className={`${baseStyles} ${variantStyles[variant]} ${className}`}>
      {children}
    </div>
  );
}