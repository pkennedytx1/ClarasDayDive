import React from 'react';

/**
 * Clara's Day Dive — Card
 * Paper-white surface with soft warm shadow. Optional hover-lift for clickable cards.
 */
export function Card({
  children,
  tone = 'white',
  padding = 'md',
  interactive = false,
  style = {},
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  const tones = {
    white: { background: 'var(--clr-white)', color: 'var(--clr-ink)' },
    cream: { background: 'var(--clr-cream)', color: 'var(--clr-ink)' },
    rose:  { background: 'var(--clr-rose)', color: 'var(--clr-cream)' },
    teal:  { background: 'var(--clr-teal)', color: 'var(--clr-white)' },
    ink:   { background: 'var(--clr-ink)', color: 'var(--clr-cream)' },
  };
  const pads = { none: '0', sm: '16px', md: '24px', lg: '32px' };
  const base = {
    borderRadius: 'var(--radius-lg)',
    padding: pads[padding],
    boxShadow: interactive && hover ? 'var(--shadow-lg)' : 'var(--shadow-md)',
    transform: interactive && hover ? 'translateY(-3px)' : 'translateY(0)',
    transition: 'transform var(--dur-base) var(--ease-out), box-shadow var(--dur-base) var(--ease-out)',
    cursor: interactive ? 'pointer' : 'default',
    ...tones[tone],
    ...style,
  };
  return (
    <div style={base}
      onMouseEnter={() => interactive && setHover(true)}
      onMouseLeave={() => interactive && setHover(false)} {...rest}>
      {children}
    </div>
  );
}
