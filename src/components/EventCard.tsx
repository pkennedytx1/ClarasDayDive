import { useState } from 'react';

interface EventCardProps {
  month: string;
  day: string;
  title: string;
  meta?: string;
  tag?: string;
}

export function EventCard({ month, day, title, meta, tag }: EventCardProps) {
  const [hover, setHover] = useState(false);

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '18px',
        background: 'var(--clr-white)',
        borderRadius: 'var(--radius-lg)',
        padding: '18px 20px',
        boxShadow: hover ? 'var(--shadow-lg)' : 'var(--shadow-md)',
        transform: hover ? 'translateY(-3px)' : 'translateY(0)',
        transition: 'transform var(--dur-base) var(--ease-out), box-shadow var(--dur-base) var(--ease-out)',
      }}
    >
      <div
        style={{
          flexShrink: 0,
          width: 64,
          height: 64,
          borderRadius: 'var(--radius-md)',
          background: 'var(--clr-rose)',
          color: 'var(--clr-cream)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '11px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
          }}
        >
          {month}
        </span>
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontStyle: 'italic',
            fontWeight: 800,
            fontSize: '26px',
            lineHeight: 1,
          }}
        >
          {day}
        </span>
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        {tag && (
          <span
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '11px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              color: 'var(--clr-sage-deep)',
            }}
          >
            {tag}
          </span>
        )}
        <h3
          style={{
            margin: '2px 0 3px',
            fontFamily: 'var(--font-display)',
            fontStyle: 'italic',
            fontWeight: 700,
            fontSize: '20px',
            color: 'var(--clr-ink)',
          }}
        >
          {title}
        </h3>
        {meta && (
          <p
            style={{
              margin: 0,
              fontFamily: 'var(--font-body)',
              fontSize: '14px',
              color: 'var(--clr-ink-60)',
            }}
          >
            {meta}
          </p>
        )}
      </div>
    </div>
  );
}
