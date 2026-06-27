import React from 'react';

/**
 * Clara's Day Dive — SearchBar (AI "ask Clara")
 * The hero's prominent AI search. Big pill on paper-white with a rose submit button.
 */
export function SearchBar({
  placeholder = 'Ask Clara what to drink…',
  buttonLabel = 'Dive in',
  suggestions = [],
  size = 'lg',
  onSubmit,
  style = {},
  ...rest
}) {
  const [value, setValue] = React.useState('');
  const [focused, setFocused] = React.useState(false);
  const pad = size === 'lg' ? '10px 10px 10px 22px' : '8px 8px 8px 18px';
  const fs = size === 'lg' ? '18px' : '16px';

  const submit = (q) => { if (onSubmit) onSubmit(q != null ? q : value); };

  return (
    <div style={{ width: '100%', ...style }}>
      <form
        onSubmit={(e) => { e.preventDefault(); submit(); }}
        style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          background: 'var(--clr-white)',
          border: `2px solid ${focused ? 'var(--clr-teal)' : 'var(--clr-ink)'}`,
          borderRadius: 'var(--radius-pill)',
          padding: pad,
          boxShadow: focused ? '0 0 0 5px rgba(44,170,160,0.16)' : 'var(--shadow-md)',
          transition: 'border-color var(--dur-base) var(--ease-out), box-shadow var(--dur-base) var(--ease-out)',
        }}
        {...rest}
      >
        <span aria-hidden="true" style={{ display: 'flex', color: 'var(--clr-rose)' }}>
          {/* sparkle — AI affordance */}
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l1.6 4.9a5 5 0 0 0 3.5 3.5L22 12l-4.9 1.6a5 5 0 0 0-3.5 3.5L12 22l-1.6-4.9a5 5 0 0 0-3.5-3.5L2 12l4.9-1.6a5 5 0 0 0 3.5-3.5L12 2z"/></svg>
        </span>
        <input
          type="text"
          value={value}
          placeholder={placeholder}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            flex: 1, border: 'none', outline: 'none', background: 'transparent',
            fontFamily: 'var(--font-body)', fontSize: fs, color: 'var(--clr-ink)', minWidth: 0,
          }}
        />
        <button type="submit" style={{
          flexShrink: 0, border: 'none', cursor: 'pointer',
          background: 'var(--clr-rose)', color: 'var(--clr-white)',
          fontFamily: 'var(--font-body)', fontSize: fs === '18px' ? '16px' : '15px', fontWeight: 600,
          padding: size === 'lg' ? '12px 24px' : '10px 18px', borderRadius: 'var(--radius-pill)',
          transition: 'background var(--dur-base) var(--ease-out)',
        }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'var(--clr-rose-deep)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'var(--clr-rose)'}>
          {buttonLabel}
        </button>
      </form>
      {suggestions.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '14px' }}>
          {suggestions.map((s) => (
            <button key={s} type="button" onClick={() => { setValue(s); submit(s); }}
              style={{
                background: 'transparent', border: '1.5px solid var(--clr-ink-15)',
                borderRadius: 'var(--radius-pill)', padding: '7px 14px', cursor: 'pointer',
                fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--clr-ink-80)',
                transition: 'all var(--dur-base) var(--ease-out)',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--clr-ink)'; e.currentTarget.style.color = 'var(--clr-cream)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--clr-ink-80)'; }}>
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
