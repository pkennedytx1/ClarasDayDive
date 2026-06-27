import React from 'react';

/**
 * Clara's Day Dive — Button
 * Pill-shaped, poster-confident. Rose primary, ink-outline secondary, teal callout, ghost.
 */
export function Button({
  children,
  variant = 'primary',
  size = 'md',
  full = false,
  disabled = false,
  iconLeft = null,
  iconRight = null,
  style = {},
  ...rest
}) {
  const sizes = {
    sm: { padding: '8px 16px', fontSize: '14px' },
    md: { padding: '12px 24px', fontSize: '16px' },
    lg: { padding: '16px 32px', fontSize: '18px' },
  };

  const variants = {
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

  const base = {
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
    transition: 'transform var(--dur-fast) var(--ease-out), background var(--dur-base) var(--ease-out), box-shadow var(--dur-base) var(--ease-out)',
    WebkitTapHighlightColor: 'transparent',
    ...sizes[size],
    ...variants[variant],
    ...style,
  };

  const onDown = (e) => { if (!disabled) e.currentTarget.style.transform = 'scale(0.96)'; };
  const onUp = (e) => { e.currentTarget.style.transform = 'scale(1)'; };
  const onEnter = (e) => {
    if (disabled) return;
    if (variant === 'primary') e.currentTarget.style.background = 'var(--clr-rose-deep)';
    if (variant === 'callout') e.currentTarget.style.background = 'var(--clr-teal-deep)';
    if (variant === 'secondary') { e.currentTarget.style.background = 'var(--clr-ink)'; e.currentTarget.style.color = 'var(--clr-cream)'; }
    if (variant === 'ghost') e.currentTarget.style.background = 'var(--clr-ink-08)';
  };
  const onLeave = (e) => {
    e.currentTarget.style.transform = 'scale(1)';
    e.currentTarget.style.background = variants[variant].background;
    e.currentTarget.style.color = variants[variant].color;
  };

  return (
    <button
      type="button"
      disabled={disabled}
      style={base}
      onMouseDown={onDown}
      onMouseUp={onUp}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      {...rest}
    >
      {iconLeft}
      {children}
      {iconRight}
    </button>
  );
}
