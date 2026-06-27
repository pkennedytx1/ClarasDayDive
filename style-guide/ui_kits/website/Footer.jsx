/* global React */
// Site footer — wordmark, hours, address, socials.
function Footer() {
  const Icon = window.CDDIcon;
  return (
    <footer style={{ background: 'var(--clr-cream-deep)', borderTop: '1px solid var(--clr-ink-08)' }}>
      <div style={{
        maxWidth: 'var(--container)', margin: '0 auto', padding: '56px var(--gutter) 40px',
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '32px',
      }}>
        <div>
          <img src="../../assets/wordmark-color.png" alt="Clara's Day Dive" style={{ height: 56, marginBottom: 14 }} />
          <p style={{ margin: 0, fontFamily: 'var(--font-body)', fontSize: '15px', color: 'var(--clr-ink-60)', maxWidth: '28ch' }}>
            Dive in for a day drink. East Austin's coupe bar &amp; patio.
          </p>
        </div>
        <div>
          <h4 style={{ margin: '0 0 12px', fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--clr-sage-deep)' }}>Hours</h4>
          {['Mon–Thu · 3pm–12am', 'Fri · 12pm–2am', 'Sat–Sun · 11am–2am'].map((h) => (
            <p key={h} style={{ margin: '0 0 6px', fontFamily: 'var(--font-body)', fontSize: '15px', color: 'var(--clr-ink-80)' }}>{h}</p>
          ))}
        </div>
        <div>
          <h4 style={{ margin: '0 0 12px', fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--clr-sage-deep)' }}>Find us</h4>
          <p style={{ margin: '0 0 6px', fontFamily: 'var(--font-body)', fontSize: '15px', color: 'var(--clr-ink-80)' }}>1814 E Cesar Chavez St</p>
          <p style={{ margin: '0 0 14px', fontFamily: 'var(--font-body)', fontSize: '15px', color: 'var(--clr-ink-80)' }}>Austin, TX 78702</p>
          <a href="#" aria-label="Instagram" style={{ display: 'inline-flex', color: 'var(--clr-ink)' }}><Icon name="instagram" size={22} /></a>
        </div>
      </div>
      <div style={{ borderTop: '1px solid var(--clr-ink-08)', padding: '18px var(--gutter)', textAlign: 'center', fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--clr-ink-40)' }}>
        © 2026 Clara's Day Dive · Please drink responsibly · 21+
      </div>
    </footer>
  );
}
window.CDDFooter = Footer;
