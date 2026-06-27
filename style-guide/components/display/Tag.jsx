import React from 'react';

/**
 * Clara's Day Dive — Tag
 * Soft filter/category chip (drink families, food trucks). Toggleable `active` state.
 */
export function Tag({ children, active = false, onClick, style = {}, ...rest }) {
  const [hover, setHover] = React.useState(false);
  const base = {
    display: 'inline-flex', alignItems: 'center', gap: '6px',
    fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: 600,
    padding: '8px 16px', borderRadius: 'var(--radius-pill)', cursor: 'pointer',
    border: `1.5px solid ${active ? 'var(--clr-ink)' : 'var(--clr-ink-15)'}`,
    background: active ? 'var(--clr-ink)' : (hover ? 'var(--clr-cream-deep)' : 'transparent'),
    color: active ? 'var(--clr-cream)' : 'var(--clr-ink)',
    transition: 'all var(--dur-base) var(--ease-out)',
    WebkitTapHighlightColor: 'transparent', userSelect: 'none',
    ...style,
  };
  return (
    <button type="button" onClick={onClick} style={base}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} {...rest}>
      {children}
    </button>
  );
}
