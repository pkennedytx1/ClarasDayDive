import React from 'react';

/**
 * Clara's Day Dive — Select
 * Native select wrapped in the brand field shell with a chevron.
 */
export function Select({ label, hint, options = [], placeholder, style = {}, id, ...rest }) {
  const [focused, setFocused] = React.useState(false);
  const inputId = id || `sel-${Math.random().toString(36).slice(2, 8)}`;

  return (
    <div style={{ width: '100%', ...style }}>
      {label && (
        <label htmlFor={inputId} style={{
          display: 'block', marginBottom: '7px',
          fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: 600, color: 'var(--clr-ink)',
        }}>{label}</label>
      )}
      <div style={{
        position: 'relative', display: 'flex', alignItems: 'center',
        background: 'var(--clr-white)',
        border: `1.5px solid ${focused ? 'var(--clr-teal)' : 'var(--clr-ink-15)'}`,
        borderRadius: 'var(--radius-md)',
        boxShadow: focused ? '0 0 0 4px rgba(44,170,160,0.15)' : 'none',
        transition: 'border-color var(--dur-base) var(--ease-out), box-shadow var(--dur-base) var(--ease-out)',
      }}>
        <select
          id={inputId}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            flex: 1, appearance: 'none', WebkitAppearance: 'none', border: 'none', outline: 'none',
            background: 'transparent', padding: '12px 14px', paddingRight: '38px',
            fontFamily: 'var(--font-body)', fontSize: '16px', color: 'var(--clr-ink)', cursor: 'pointer',
          }}
          {...rest}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((o) => {
            const value = typeof o === 'string' ? o : o.value;
            const text = typeof o === 'string' ? o : o.label;
            return <option key={value} value={value}>{text}</option>;
          })}
        </select>
        <span style={{ position: 'absolute', right: '14px', pointerEvents: 'none', color: 'var(--clr-ink-60)' }} aria-hidden="true">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
        </span>
      </div>
      {hint && (
        <div style={{ marginTop: '6px', fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--clr-ink-60)' }}>{hint}</div>
      )}
    </div>
  );
}
