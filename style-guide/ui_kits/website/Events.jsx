/* global React */
// Events calendar — EventCard list on a rose feature band.
function Events() {
  const { Eyebrow, EventCard } = window.CDD_DS;
  const [rsvp, setRsvp] = React.useState(null);
  const events = [
    { month: 'JUL', day: '18', tag: 'Live music', title: 'Patio vinyl night', time: '7–10pm · Free', desc: 'Soul & disco on the turntable, frosé specials all night.' },
    { month: 'JUL', day: '24', tag: 'Market', title: 'Makers & shakers market', time: '12–5pm · Free', desc: 'Local makers out front, spritz flight inside.' },
    { month: 'AUG', day: '02', tag: 'Tasting', title: 'Low-ABV happy hour', time: '4–6pm · $25', desc: 'Six sessionable pours, guided by Clara herself.' },
  ];
  return (
    <section id="events" style={{ background: 'var(--clr-rose)' }}>
      <div style={{ maxWidth: 'var(--container)', margin: '0 auto', padding: 'var(--section-y) var(--gutter)' }}>
        <Eyebrow color="cream">On the calendar</Eyebrow>
        <h2 style={{ margin: '10px 0 28px', fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 700, fontSize: 'var(--fs-display-lg)', letterSpacing: '-0.02em', color: 'var(--clr-cream)' }}>Upcoming events</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
          {events.map((e) => (
            <EventCard key={e.day + e.title} month={e.month} day={e.day} tag={e.tag}
              title={e.title} meta={e.time + ' · ' + e.desc}
              onRsvp={() => setRsvp(e.title)} />
          ))}
        </div>
        {rsvp && (
          <p style={{ marginTop: '20px', fontFamily: 'var(--font-body)', fontSize: '15px', color: 'var(--clr-cream)' }}>
            You're on the list for <strong>{rsvp}</strong> — see you there.
          </p>
        )}
      </div>
    </section>
  );
}
window.CDDEvents = Events;
