/* global React */
// Hero — penguin/coupe symbol + headline + the prominent AI search bar.
function Hero() {
  const { SearchBar, Eyebrow } = window.CDD_DS;
  const [answer, setAnswer] = React.useState(null);

  const reply = (q) => {
    const map = {
      'Something pink & frozen': "Try the Penguin Punch — frozen, very pink, zero-proof. Or a Frosé if you want the buzz.",
      'Low-ABV spritz': "Clara's Spritz: Aperol, prosecco, a twist of grapefruit. Sessionable all afternoon.",
      "What's on the patio?": "Shade, string lights, dog bowls, and Bird Bird Biscuit til 2. Open till midnight.",
    };
    setAnswer(map[q] || "Clara says: come on in — we'll pour you something good.");
  };

  return (
    <section id="top" style={{ position: 'relative', overflow: 'hidden', background: 'var(--clr-cream)' }}>
      <div style={{
        maxWidth: 'var(--container)', margin: '0 auto', padding: '64px var(--gutter) 80px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
      }}>
        <img src="../../assets/logo-symbol-color.png" alt="Two penguins diving into a coupe glass"
          style={{ width: 'min(340px, 70vw)', height: 'auto', marginBottom: '28px', filter: 'drop-shadow(0 14px 30px rgba(28,28,26,0.14))' }} />
        <Eyebrow color="sage" style={{ marginBottom: '14px' }}>East Austin · Coupe bar &amp; patio</Eyebrow>
        <h1 style={{
          margin: 0, fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 800,
          fontSize: 'var(--fs-display-xl)', lineHeight: 1.02, letterSpacing: '-0.02em', color: 'var(--clr-ink)',
          maxWidth: '14ch',
        }}>Dive in for a day drink.</h1>
        <p style={{
          margin: '20px 0 32px', fontFamily: 'var(--font-body)', fontSize: 'var(--fs-xl)',
          lineHeight: 1.4, color: 'var(--clr-ink-80)', maxWidth: '40ch',
        }}>Sun's out, penguins in. A neighborhood coupe bar with cold drinks, good shade, and a rotating cast of food trucks.</p>
        <div style={{ width: 'min(560px, 100%)' }}>
          <SearchBar
            placeholder="Ask Clara what to drink…"
            buttonLabel="Dive in"
            suggestions={['Something pink & frozen', 'Low-ABV spritz', "What's on the patio?"]}
            onSubmit={reply}
          />
          {answer && (
            <div style={{
              marginTop: '16px', background: 'var(--clr-white)', border: '1.5px solid var(--clr-ink-15)',
              borderRadius: 'var(--radius-md)', padding: '14px 18px', textAlign: 'left',
              fontFamily: 'var(--font-body)', fontSize: '15px', lineHeight: 1.5, color: 'var(--clr-ink)',
              boxShadow: 'var(--shadow-sm)',
            }}>
              <strong style={{ color: 'var(--clr-rose)' }}>Clara:</strong> {answer}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
window.CDDHero = Hero;
