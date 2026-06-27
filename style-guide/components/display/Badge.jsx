import React from 'react';

/**
 * Clara's Day Dive — Badge
 * Small status pill for menu/drink meta: "New", "Seasonal", "Sold out", "21+".
 */
export function Badge({ children, tone = 'rose', style = {}, ...rest }) {
  const tones = {
    rose:  { bg: 'var(--clr-rose)', fg: 'var(--clr-white)' },
    teal:  { bg: 'var(--clr-teal)', fg: 'var(--clr-white)' },
    sage:  { bg: 'var(--clr-sage)', fg: 'var(--clr-ink)' },
    butter:{ bg: 'var(--clr-butter)', fg: 'var(--clr-ink)' },
    ink:   { bg: 'var(--clr-ink)', fg: 'var(--clr-cream)' },
    outline:{ bg: 'transparent', fg: 'var(--clr-ink)', border: '1.5px solid var(--clr-ink)' },
  };
  const t = tones[tone] || tones.rose;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      background: t.bg, color: t.fg, border: t.border || '1.5px solid transparent',
      fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 700,
      textTransform: 'uppercase', letterSpacing: '0.08em',
      padding: '4px 10px', borderRadius: 'var(--radius-pill)',
      ...style,
    }} {...rest}>
      {children}
    </span>
  );
}
