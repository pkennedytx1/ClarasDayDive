/* global React */
// Drinks menu — filterable with Tag chips, MenuRow list, on paper-white.
function Drinks() {
  const { Eyebrow, Tag, MenuRow, Badge } = window.CDD_DS;
  const [filter, setFilter] = React.useState('All');
  const drinks = [
    { cat: 'Spritz', name: "Clara's Spritz", price: '$11', badge: 'House', desc: 'Aperol, prosecco, a twist of grapefruit oil.' },
    { cat: 'Spritz', name: 'Limoncello Fizz', price: '$12', desc: 'Limoncello, soda, lemon, a little thyme.' },
    { cat: 'Frozen', name: 'Frozen Negroni', price: '$13', badge: 'Seasonal', desc: 'Campari, gin, sweet vermouth — slushied.' },
    { cat: 'Frozen', name: 'Frosé', price: '$12', desc: 'Rosé, strawberry, lemon. Dangerously easy.' },
    { cat: 'Classic', name: 'Coupe Martini', price: '$14', desc: 'Gin or vodka, dry, lemon or olive.' },
    { cat: 'Zero-proof', name: 'Penguin Punch', price: '$9', badge: 'No ABV', desc: 'Frozen, very pink, all the fun, none of the buzz.' },
  ];
  const cats = ['All', 'Spritz', 'Frozen', 'Classic', 'Zero-proof'];
  const shown = filter === 'All' ? drinks : drinks.filter((d) => d.cat === filter);

  return (
    <section id="drinks" style={{ background: 'var(--clr-white)', borderTop: '1px solid var(--clr-ink-08)' }}>
      <div style={{ maxWidth: 'var(--container)', margin: '0 auto', padding: 'var(--section-y) var(--gutter)' }}>
        <Eyebrow color="rose">What's pouring</Eyebrow>
        <h2 style={{ margin: '10px 0 24px', fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 700, fontSize: 'var(--fs-display-lg)', letterSpacing: '-0.02em', color: 'var(--clr-ink)' }}>The drinks menu</h2>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px' }}>
          {cats.map((c) => <Tag key={c} active={filter === c} onClick={() => setFilter(c)}>{c}</Tag>)}
        </div>
        <div style={{ maxWidth: '760px' }}>
          {shown.map((d) => (
            <MenuRow key={d.name} name={d.name} price={d.price} badges={d.badge ? [d.badge] : []} description={d.desc} />
          ))}
        </div>
      </div>
    </section>
  );
}
window.CDDDrinks = Drinks;
