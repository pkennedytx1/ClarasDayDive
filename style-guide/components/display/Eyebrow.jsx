import React from 'react';

/**
 * Clara's Day Dive — Eyebrow
 * Uppercase tracked overline in sage (default) or teal. Sets section context.
 */
export function Eyebrow({ children, color = 'sage', as = 'div', style = {}, ...rest }) {
  const Tag = as;
  const colors = {
    sage: 'var(--clr-sage-deep)',
    teal: 'var(--clr-teal-deep)',
    rose: 'var(--clr-rose)',
    cream: 'var(--clr-cream)',
  };
  return (
    <Tag style={{
      fontFamily: 'var(--font-body)', fontSize: 'var(--fs-eyebrow)', fontWeight: 700,
      textTransform: 'uppercase', letterSpacing: 'var(--ls-eyebrow)',
      color: colors[color] || color, ...style,
    }} {...rest}>
      {children}
    </Tag>
  );
}
