/* global React */
// What's Here — food trucks / coffee / patio tiles using Card.
function WhatsHere() {
  const { Card, Eyebrow } = window.CDD_DS;
  const Icon = window.CDDIcon;
  const tiles = [
    { icon: 'truck', tone: 'cream', tag: 'Rotating', title: 'Food trucks', body: 'Bird Bird Biscuit weekdays, Veracruz tacos on weekends. Always something sizzling out back.' },
    { icon: 'coffee', tone: 'white', tag: 'Til noon', title: 'Morning coffee', body: 'Local roast, cold brew on tap, and a flat white that holds up to the heat.' },
    { icon: 'sun', tone: 'white', tag: 'Open late', title: 'The patio', body: 'Shaded, dog-friendly, string lights overhead. Open till midnight when the weather plays nice.' },
  ];
  return (
    <section id="here" style={{ background: 'var(--clr-cream)' }}>
      <div style={{ maxWidth: 'var(--container)', margin: '0 auto', padding: 'var(--section-y) var(--gutter)' }}>
        <Eyebrow color="teal">More than a bar</Eyebrow>
        <h2 style={{ margin: '10px 0 28px', fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 700, fontSize: 'var(--fs-display-lg)', letterSpacing: '-0.02em', color: 'var(--clr-ink)' }}>What's here</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
          {tiles.map((t) => (
            <Card key={t.title} tone={t.tone} interactive>
              <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-pill)', background: 'var(--clr-rose)', color: 'var(--clr-cream)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <Icon name={t.icon} size={24} />
              </div>
              <Eyebrow color="sage" style={{ marginBottom: '6px' }}>{t.tag}</Eyebrow>
              <h3 style={{ margin: '0 0 8px', fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 700, fontSize: '26px', color: 'var(--clr-ink)' }}>{t.title}</h3>
              <p style={{ margin: 0, fontFamily: 'var(--font-body)', fontSize: '15px', lineHeight: 1.55, color: 'var(--clr-ink-60)' }}>{t.body}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
window.CDDWhatsHere = WhatsHere;
