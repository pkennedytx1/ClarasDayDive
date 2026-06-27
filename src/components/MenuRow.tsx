interface MenuRowProps {
  name: string;
  price: string;
  description?: string;
  badges?: string[];
}

export function MenuRow({ name, price, description, badges = [] }: MenuRowProps) {
  return (
    <div style={{ padding: '14px 0', borderBottom: '1px solid var(--clr-ink-15)' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', flexWrap: 'wrap' }}>
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontStyle: 'italic',
            fontWeight: 700,
            fontSize: '21px',
            color: 'var(--clr-ink)',
          }}
        >
          {name}
        </span>
        {badges.length > 0 && (
          <span style={{ display: 'inline-flex', gap: '6px', flexShrink: 0 }}>
            {badges.map((b) => (
              <span
                key={b}
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '10px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: 'var(--clr-teal-deep)',
                  border: '1.5px solid var(--clr-teal)',
                  borderRadius: 'var(--radius-pill)',
                  padding: '2px 8px',
                }}
              >
                {b}
              </span>
            ))}
          </span>
        )}
        <span
          aria-hidden="true"
          style={{
            flex: 1,
            borderBottom: '1.5px dotted var(--clr-ink-40)',
            transform: 'translateY(-4px)',
          }}
        />
        <span
          style={{
            fontFamily: 'var(--font-body)',
            fontWeight: 600,
            fontSize: '18px',
            color: 'var(--clr-rose)',
            whiteSpace: 'nowrap',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {price}
        </span>
      </div>
      {description && (
        <p
          style={{
            margin: '4px 0 0',
            maxWidth: '54ch',
            fontFamily: 'var(--font-body)',
            fontSize: '15px',
            lineHeight: 1.5,
            color: 'var(--clr-ink-60)',
          }}
        >
          {description}
        </p>
      )}
    </div>
  );
}
