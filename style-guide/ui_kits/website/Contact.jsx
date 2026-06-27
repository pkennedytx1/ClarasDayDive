/* global React */
// Contact — event-coordinator form on ink, with the scarf illustration alongside.
function Contact() {
  const { Eyebrow, Input, Textarea, Select, Button } = window.CDD_DS;
  const [sent, setSent] = React.useState(false);

  return (
    <section id="contact" style={{ background: 'var(--clr-ink)' }}>
      <div style={{
        maxWidth: 'var(--container)', margin: '0 auto', padding: 'var(--section-y) var(--gutter)',
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '48px', alignItems: 'center',
      }}>
        <div>
          <Eyebrow color="teal">Book the bar</Eyebrow>
          <h2 style={{ margin: '10px 0 16px', fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 700, fontSize: 'var(--fs-display-lg)', letterSpacing: '-0.02em', color: 'var(--clr-cream)' }}>Plan your party</h2>
          <p style={{ margin: '0 0 28px', fontFamily: 'var(--font-body)', fontSize: 'var(--fs-lg)', lineHeight: 1.55, color: 'var(--clr-cream)', opacity: 0.78, maxWidth: '42ch' }}>
            Birthdays, send-offs, slow Sunday socials — tell us what you're dreaming up and our event coordinator will write back within a day.
          </p>
          <img src="../../assets/scarf.jpg" alt="Clara's Day Dive scarf illustration"
            style={{ width: 'min(280px, 60%)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-lg)' }} />
        </div>

        <div style={{ background: 'var(--clr-cream)', borderRadius: 'var(--radius-xl)', padding: 'clamp(24px, 4vw, 40px)', boxShadow: 'var(--shadow-lg)' }}>
          {sent ? (
            <div style={{ textAlign: 'center', padding: '32px 8px' }}>
              <h3 style={{ margin: '0 0 8px', fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 800, fontSize: '32px', color: 'var(--clr-rose)' }}>Cheers, y'all.</h3>
              <p style={{ margin: 0, fontFamily: 'var(--font-body)', fontSize: '16px', color: 'var(--clr-ink-80)' }}>We've got your note. Clara will be in touch within a day.</p>
            </div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); setSent(true); }} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <Input label="Name" placeholder="Clara P." required />
                <Input label="Email" type="email" placeholder="you@email.com" required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <Select label="Event type" placeholder="Choose…" options={['Birthday', 'Corporate', 'Send-off', 'Just because']} />
                <Select label="Party size" placeholder="Choose…" options={['Up to 10', '10–25', '25–50', '50+']} />
              </div>
              <Textarea label="Tell us about your event" rows={4} placeholder="Date, vibe, must-haves…" />
              <Button type="submit" variant="primary" size="lg" full>Send it over</Button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
window.CDDContact = Contact;
