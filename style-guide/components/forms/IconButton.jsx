import React from 'react';

/**
 * Clara's Day Dive — IconButton
 * Circular icon-only control for nav, search submit, social, close.
 */
export function IconButton({
  children,
  variant = 'solid',
  size = 'md',
  label,
  disabled = false,
  style = {},
  ...rest
}) {
  const dims = { sm: 36, md: 44, lg: 52 };
  const d = dims[size];

  const variants = {
    solid: { background: 'var(--clr-rose)', color: 'var(--clr-white)', border: '2px solid var(--clr-rose)' },
    ink: { background: 'var(--clr-ink)', color: 'var(--clr-cream)', border: '2px solid var(--clr-ink)' },
    outline: { background: 'transparent', color: 'var(--clr-ink)', border: '2px solid var(--clr-ink)' },
    ghost: { background: 'transparent', color: 'var(--clr-ink)', border: '2px solid transparent' },
  };

  const base = {
    width: d, height: d,
    borderRadius: 'var(--radius-pill)',
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.45 : 1,
    transition: 'transform var(--dur-fast) var(--ease-out), background var(--dur-base) var(--ease-out)',
    WebkitTapHighlightColor: 'transparent',
    ...variants[variant],
    ...style,
  };

  const onDown = (e) => { if (!disabled) e.currentTarget.style.transform = 'scale(0.92)'; };
  const onUp = (e) => { e.currentTarget.style.transform = 'scale(1)'; };
  const onLeave = (e) => { e.currentTarget.style.transform = 'scale(1)'; };

  return (
    <button type="button" aria-label={label} disabled={disabled} style={base}
      onMouseDown={onDown} onMouseUp={onUp} onMouseLeave={onLeave} {...rest}>
      {children}
    </button>
  );
}
