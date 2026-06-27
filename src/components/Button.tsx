import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'callout' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  full?: boolean;
  href?: string;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  full = false,
  disabled = false,
  href,
  style,
  ...rest
}: ButtonProps) {
  const sizes: Record<ButtonSize, CSSProperties> = {
    sm: { padding: '8px 16px', fontSize: '14px' },
    md: { padding: '12px 24px', fontSize: '16px' },
    lg: { padding: '16px 32px', fontSize: '18px' },
  };

  const variants: Record<ButtonVariant, CSSProperties> = {
    primary: {
      background: 'var(--clr-rose)',
      color: 'var(--clr-white)',
      border: '2px solid var(--clr-rose)',
      boxShadow: 'var(--shadow-rose)',
    },
    secondary: {
      background: 'transparent',
      color: 'var(--clr-ink)',
      border: '2px solid var(--clr-ink)',
      boxShadow: 'none',
    },
    callout: {
      background: 'var(--clr-teal)',
      color: 'var(--clr-white)',
      border: '2px solid var(--clr-teal)',
      boxShadow: 'none',
    },
    ghost: {
      background: 'transparent',
      color: 'var(--clr-ink)',
      border: '2px solid transparent',
      boxShadow: 'none',
    },
  };

  const base: CSSProperties = {
    fontFamily: 'var(--font-body)',
    fontWeight: 600,
    letterSpacing: '0.01em',
    borderRadius: 'var(--radius-pill)',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.45 : 1,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    width: full ? '100%' : 'auto',
    textDecoration: 'none',
    transition:
      'transform var(--dur-fast) var(--ease-out), background var(--dur-base) var(--ease-out), box-shadow var(--dur-base) var(--ease-out)',
    WebkitTapHighlightColor: 'transparent',
    ...sizes[size],
    ...variants[variant],
    ...style,
  };

  const handlers = {
    onMouseDown: (e: React.MouseEvent<HTMLElement>) => {
      if (!disabled) (e.currentTarget as HTMLElement).style.transform = 'scale(0.96)';
    },
    onMouseUp: (e: React.MouseEvent<HTMLElement>) => {
      (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
    },
    onMouseEnter: (e: React.MouseEvent<HTMLElement>) => {
      if (disabled) return;
      const el = e.currentTarget as HTMLElement;
      if (variant === 'primary') el.style.background = 'var(--clr-rose-deep)';
      if (variant === 'callout') el.style.background = 'var(--clr-teal-deep)';
      if (variant === 'secondary') {
        el.style.background = 'var(--clr-ink)';
        el.style.color = 'var(--clr-cream)';
      }
      if (variant === 'ghost') el.style.background = 'var(--clr-ink-08)';
    },
    onMouseLeave: (e: React.MouseEvent<HTMLElement>) => {
      const el = e.currentTarget as HTMLElement;
      el.style.transform = 'scale(1)';
      el.style.background = variants[variant].background as string;
      el.style.color = variants[variant].color as string;
    },
  };

  if (href) {
    return (
      <a href={href} style={base} {...handlers}>
        {children}
      </a>
    );
  }

  return (
    <button type="button" disabled={disabled} style={base} {...handlers} {...rest}>
      {children}
    </button>
  );
}
