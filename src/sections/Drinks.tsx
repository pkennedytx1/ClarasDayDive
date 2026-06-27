import { useState } from 'react';
import { BrandMark } from '@/components/BrandMark';
import { Reveal } from '@/components/Reveal';
import { getDrinksContent } from '@/lib/content';

export function Drinks() {
  const drinks = getDrinksContent();
  const [filter, setFilter] = useState('All');
  const shown = filter === 'All' ? drinks.items : drinks.items.filter((d) => d.cat === filter);

  return (
    <section id="drinks" className="section section--menu section--compact" aria-labelledby="drinks-heading">
      <div className="container">
        <Reveal>
          <header className="section-head section-head--brand">
            <div>
              <p className="eyebrow eyebrow--rose">What's pouring</p>
              <h2 id="drinks-heading" className="display-lg">
                The drinks menu
              </h2>
            </div>
            <BrandMark asset="symbol" size={48} className="section-head__mark" loading="lazy" />
          </header>
        </Reveal>

        <Reveal delay={80}>
          <div className="tag-list" role="tablist" aria-label="Filter drinks by category">
            {drinks.categories.map((c) => (
              <button
                key={c}
                type="button"
                role="tab"
                aria-selected={filter === c}
                className={`tag${filter === c ? ' is-active' : ''}`}
                onClick={() => setFilter(c)}
              >
                {c}
              </button>
            ))}
          </div>
        </Reveal>

        <div className="menu-list" itemScope itemType="https://schema.org/Menu">
          <meta itemProp="name" content="Clara's Day Dive drinks menu" />
          {shown.map((d, i) => (
            <Reveal key={d.name} stagger={i} delay={120}>
              <article className="menu-row" itemScope itemType="https://schema.org/MenuItem">
                <div className="menu-row__line">
                  <h3 className="menu-row__name" itemProp="name">
                    {d.name}
                  </h3>
                  {d.badge && <span className="menu-row__badge">{d.badge}</span>}
                  <span className="menu-row__dots" aria-hidden="true" />
                  <span className="menu-row__price" itemProp="offers" itemScope itemType="https://schema.org/Offer">
                    <meta itemProp="priceCurrency" content="USD" />
                    <span itemProp="price">{d.price.replace('$', '')}</span>
                  </span>
                </div>
                <p className="menu-row__desc" itemProp="description">
                  {d.desc}
                </p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
