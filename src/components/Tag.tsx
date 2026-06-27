import { useState, type CSSProperties, type ReactNode } from 'react';

interface TagProps {
  children: ReactNode;
  active?: boolean;
  onClick?: () => void;
  style?: CSSProperties;
}

export function Tag({ children, active = false, onClick, style }: TagProps) {
  const [hover, setHover] = useState(false);

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        fontFamily: 'var(--font-body)',
        fontSize: '14px',
        fontWeight: 600,
        padding: '8px 16px',
        borderRadius: 'var(--radius-pill)',
        cursor: 'pointer',
        border: `1.5px solid ${active ? 'var(--clr-ink)' : 'var(--clr-ink-15)'}`,
        background: active ? 'var(--clr-ink)' : hover ? 'var(--clr-cream-deep)' : 'transparent',
        color: active ? 'var(--clr-cream)' : 'var(--clr-ink)',
        transition: 'all var(--dur-base) var(--ease-out)',
        WebkitTapHighlightColor: 'transparent',
        userSelect: 'none',
        ...style,
      }}
    >
      {children}
    </button>
  );
}
