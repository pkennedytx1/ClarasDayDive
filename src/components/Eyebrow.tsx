import type { CSSProperties, ElementType, ReactNode } from 'react';

type EyebrowColor = 'sage' | 'teal' | 'rose' | 'cream';

interface EyebrowProps {
  children: ReactNode;
  color?: EyebrowColor;
  as?: ElementType;
  style?: CSSProperties;
}

export function Eyebrow({ children, color = 'sage', as: Tag = 'div', style }: EyebrowProps) {
  const colors: Record<EyebrowColor, string> = {
    sage: 'var(--clr-sage-deep)',
    teal: 'var(--clr-teal-deep)',
    rose: 'var(--clr-rose)',
    cream: 'var(--clr-cream)',
  };

  return (
    <Tag
      style={{
        fontFamily: 'var(--font-body)',
        fontSize: 'var(--fs-eyebrow)',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: 'var(--ls-eyebrow)',
        color: colors[color],
        ...style,
      }}
    >
      {children}
    </Tag>
  );
}
