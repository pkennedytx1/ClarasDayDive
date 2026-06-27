import React from 'react';

/**
 * Clara's Day Dive — NavBar
 * Sticky single-page site nav. Translucent cream on scroll, wordmark left, links + CTA right.
 */
export function NavBar({
  logoSrc,
  links = [],
  ctaLabel = 'Reserve',
  onCta,
  scrolled = false,
  style = {},
  ...rest
}) {
  const [open, setOpen] = React.useState(false);
  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 50,
      background: scrolled ? 'rgba(237,229,207,0.86)' : 'transparent',
      backdropFilter: scrolled ? 'saturate(140%) blur(10px)' : 'none',
      WebkitBackdropFilter: scrolled ? 'saturate(140%) blur(10px)' : 'none',
      borderBottom: scrolled ? '1px solid var(--clr-ink-08)' : '1px solid transparent',
      transition: 'background var(--dur-base) var(--ease-out), border-color var(--dur-base) var(--ease-out)',
      ...style,
    }} {...rest}>
      <nav style={{
        maxWidth: 'var(--container)', margin: '0 auto',
        padding: '14px var(--gutter)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px',
      }}>
        <a href="#top" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
          {logoSrc
            ? <img src={logoSrc} alt="Clara's Day Dive" style={{ height: 40, objectFit: 'contain' }} />
            : <span style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 800, fontSize: 22, color: 'var(--clr-ink)' }}>Clara's</span>}
        </a>

        {/* desktop links */}
        <div className="cdd-nav-links" style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
          {links.map((l) => (
            <a key={l.label} href={l.href} style={{
              fontFamily: 'var(--font-body)', fontSize: '15px', fontWeight: 600,
              color: 'var(--clr-ink)', textDecoration: 'none', letterSpacing: '0.01em',
              transition: 'color var(--dur-fast) var(--ease-out)',
            }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--clr-rose)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--clr-ink)'}>
              {l.label}
            </a>
          ))}
          <button type="button" onClick={onCta} style={{
            border: 'none', cursor: 'pointer', background: 'var(--clr-rose)', color: 'var(--clr-white)',
            fontFamily: 'var(--font-body)', fontSize: '15px', fontWeight: 600,
            padding: '10px 20px', borderRadius: 'var(--radius-pill)', boxShadow: 'var(--shadow-rose)',
            transition: 'background var(--dur-base) var(--ease-out)',
          }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--clr-rose-deep)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'var(--clr-rose)'}>
            {ctaLabel}
          </button>
        </div>

        {/* mobile toggle */}
        <button type="button" aria-label="Menu" className="cdd-nav-toggle"
          onClick={() => setOpen((o) => !o)}
          style={{
            display: 'none', border: 'none', background: 'transparent', cursor: 'pointer',
            color: 'var(--clr-ink)', padding: 6,
          }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><line x1="3" y1="7" x2="21" y2="7"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="17" x2="21" y2="17"/></svg>
        </button>
      </nav>

      {open && (
        <div className="cdd-nav-sheet" style={{
          padding: '8px var(--gutter) 20px', display: 'flex', flexDirection: 'column', gap: '4px',
          background: 'var(--clr-cream)', borderTop: '1px solid var(--clr-ink-08)',
        }}>
          {links.map((l) => (
            <a key={l.label} href={l.href} onClick={() => setOpen(false)} style={{
              fontFamily: 'var(--font-body)', fontSize: '17px', fontWeight: 600,
              color: 'var(--clr-ink)', textDecoration: 'none', padding: '12px 0',
              borderBottom: '1px solid var(--clr-ink-08)',
            }}>{l.label}</a>
          ))}
          <button type="button" onClick={() => { setOpen(false); onCta && onCta(); }} style={{
            marginTop: 12, border: 'none', cursor: 'pointer', background: 'var(--clr-rose)', color: 'var(--clr-white)',
            fontFamily: 'var(--font-body)', fontSize: '16px', fontWeight: 600,
            padding: '14px', borderRadius: 'var(--radius-pill)',
          }}>{ctaLabel}</button>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .cdd-nav-links { display: none !important; }
          .cdd-nav-toggle { display: inline-flex !important; }
        }
      `}</style>
    </header>
  );
}
