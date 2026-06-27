import { useState, type CSSProperties, type ReactNode } from 'react';

type CardTone = 'white' | 'cream' | 'rose' | 'teal' | 'ink';
type CardPadding = 'none' | 'sm' | 'md' | 'lg';

interface CardProps {
  children: ReactNode;
  tone?: CardTone;
  padding?: CardPadding;
  interactive?: boolean;
  style?: CSSProperties;
}

export function Card({ children, tone = 'white', padding = 'md', interactive = false, style }: CardProps) {
  const [hover, setHover] = useState(false);

  const tones: Record<CardTone, CSSProperties> = {
    white: { background: 'var(--clr-white)', color: 'var(--clr-ink)' },
    cream: { background: 'var(--clr-cream)', color: 'var(--clr-ink)' },
    rose: { background: 'var(--clr-rose)', color: 'var(--clr-cream)' },
    teal: { background: 'var(--clr-teal)', color: 'var(--clr-white)' },
    ink: { background: 'var(--clr-ink)', color: 'var(--clr-cream)' },
  };

  const pads: Record<CardPadding, string> = {
    none: '0',
    sm: '16px',
    md: '24px',
    lg: '32px',
  };

  return (
    <div
      style={{
        borderRadius: 'var(--radius-lg)',
        padding: pads[padding],
        boxShadow: interactive && hover ? 'var(--shadow-lg)' : 'var(--shadow-md)',
        transform: interactive && hover ? 'translateY(-3px)' : 'translateY(0)',
        transition: 'transform var(--dur-base) var(--ease-out), box-shadow var(--dur-base) var(--ease-out)',
        cursor: interactive ? 'pointer' : 'default',
        ...tones[tone],
        ...style,
      }}
      onMouseEnter={() => interactive && setHover(true)}
      onMouseLeave={() => interactive && setHover(false)}
    >
      {children}
    </div>
  );
}
