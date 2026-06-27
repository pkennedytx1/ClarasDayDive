import React from 'react';

/**
 * Clara's Day Dive — Textarea
 * Multi-line field (contact form messages). Matches Input styling.
 */
export function Textarea({ label, hint, error, rows = 4, style = {}, id, ...rest }) {
  const [focused, setFocused] = React.useState(false);
  const inputId = id || `ta-${Math.random().toString(36).slice(2, 8)}`;

  return (
    <div style={{ width: '100%', ...style }}>
      {label && (
        <label htmlFor={inputId} style={{
          display: 'block', marginBottom: '7px',
          fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: 600, color: 'var(--clr-ink)',
        }}>{label}</label>
      )}
      <textarea
        id={inputId}
        rows={rows}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: '100%', boxSizing: 'border-box', resize: 'vertical',
          background: 'var(--clr-white)',
          border: `1.5px solid ${error ? 'var(--clr-rose)' : focused ? 'var(--clr-teal)' : 'var(--clr-ink-15)'}`,
          borderRadius: 'var(--radius-md)', padding: '12px 14px',
          boxShadow: focused ? '0 0 0 4px rgba(44,170,160,0.15)' : 'none',
          fontFamily: 'var(--font-body)', fontSize: '16px', color: 'var(--clr-ink)',
          lineHeight: 1.5, outline: 'none',
          transition: 'border-color var(--dur-base) var(--ease-out), box-shadow var(--dur-base) var(--ease-out)',
        }}
        {...rest}
      />
      {(hint || error) && (
        <div style={{
          marginTop: '6px', fontFamily: 'var(--font-body)', fontSize: '13px',
          color: error ? 'var(--clr-rose-deep)' : 'var(--clr-ink-60)',
        }}>{error || hint}</div>
      )}
    </div>
  );
}
