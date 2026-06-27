import React from 'react';

/**
 * Clara's Day Dive — Input
 * Soft pill/rounded text field on paper-white, ink focus ring in teal.
 */
export function Input({
  label,
  hint,
  error,
  type = 'text',
  pill = false,
  iconLeft = null,
  style = {},
  id,
  ...rest
}) {
  const [focused, setFocused] = React.useState(false);
  const inputId = id || `inp-${Math.random().toString(36).slice(2, 8)}`;

  const wrap = {
    display: 'flex', alignItems: 'center', gap: '10px',
    background: 'var(--clr-white)',
    border: `1.5px solid ${error ? 'var(--clr-rose)' : focused ? 'var(--clr-teal)' : 'var(--clr-ink-15)'}`,
    borderRadius: pill ? 'var(--radius-pill)' : 'var(--radius-md)',
    padding: pill ? '12px 20px' : '12px 14px',
    boxShadow: focused ? '0 0 0 4px rgba(44,170,160,0.15)' : 'none',
    transition: 'border-color var(--dur-base) var(--ease-out), box-shadow var(--dur-base) var(--ease-out)',
  };

  return (
    <div style={{ width: '100%', ...style }}>
      {label && (
        <label htmlFor={inputId} style={{
          display: 'block', marginBottom: '7px',
          fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: 600, color: 'var(--clr-ink)',
        }}>{label}</label>
      )}
      <div style={wrap}>
        {iconLeft && <span style={{ display: 'flex', color: 'var(--clr-ink-60)' }}>{iconLeft}</span>}
        <input
          id={inputId}
          type={type}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            flex: 1, border: 'none', outline: 'none', background: 'transparent',
            fontFamily: 'var(--font-body)', fontSize: '16px', color: 'var(--clr-ink)',
            minWidth: 0,
          }}
          {...rest}
        />
      </div>
      {(hint || error) && (
        <div style={{
          marginTop: '6px', fontFamily: 'var(--font-body)', fontSize: '13px',
          color: error ? 'var(--clr-rose-deep)' : 'var(--clr-ink-60)',
        }}>{error || hint}</div>
      )}
    </div>
  );
}
