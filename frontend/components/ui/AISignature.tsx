'use client';

export interface AISignatureProps {
  withBorder?: boolean;
  className?: string;
}

export default function AISignature({ withBorder = false, className = '' }: AISignatureProps) {
  const borderStyles = withBorder ? 'border-l-4 border-dashed border-ocre pl-3' : '';

  return (
    <div
      className={`inline-flex items-center gap-2 ${borderStyles} ${className}`}
      aria-label="Contenu généré par l'intelligence artificielle"
    >
      <span className="inline-flex items-center gap-1 rounded-full bg-ocre/10 px-2 py-0.5 font-body text-caption text-encre motion-safe:animate-pulse">
        <span className="h-1.5 w-1.5 rounded-full bg-ocre motion-safe:animate-pulse" aria-hidden="true" />
        IA
      </span>
    </div>
  );
}