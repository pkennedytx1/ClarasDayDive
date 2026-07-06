import { useId, type KeyboardEvent, useState } from 'react';
import { Reveal } from '@/components/Reveal';
import { getDrinksContent } from '@/lib/content';

export function Drinks() {
  const drinks = getDrinksContent();
  const [filter, setFilter] = useState('All');
  const shown = filter === 'All' ? drinks.items : drinks.items.filter((d) => d.cat === filter);
  const panelId = useId();

  const onTabKeyDown = (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft' && e.key !== 'Home' && e.key !== 'End') return;
    e.preventDefault();
    const tabs = e.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('[role="tab"]');
    if (!tabs?.length) return;
    let next = index;
    if (e.key === 'ArrowRight') next = (index + 1) % tabs.length;
    if (e.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
    if (e.key === 'Home') next = 0;
    if (e.key === 'End') next = tabs.length - 1;
    const tab = tabs[next];
    tab?.focus();
    tab?.click();
  };

  return (
    <section id="drinks" className="section section--menu section--compact" aria-labelledby="drinks-heading">
      <div className="container">
        <div className="section-rail">
        <Reveal>
          <header className="section-head section-head--brand">
            <div>
              <p className="eyebrow eyebrow--rose">What's pouring</p>
              <h2 id="drinks-heading" className="display-lg">
                The drinks menu
              </h2>
            </div>
          </header>
        </Reveal>

        <Reveal delay={80}>
          <div className="tag-list" role="tablist" aria-label="Filter drinks by category">
            {drinks.categories.map((c, i) => {
              const tabId = `${panelId}-tab-${c}`;
              return (
                <button
                  key={c}
                  id={tabId}
                  type="button"
                  role="tab"
                  aria-selected={filter === c}
                  aria-controls={`${panelId}-panel`}
                  tabIndex={filter === c ? 0 : -1}
                  className={`tag${filter === c ? ' is-active' : ''}`}
                  onClick={() => setFilter(c)}
                  onKeyDown={(e) => onTabKeyDown(e, i)}
                >
                  {c}
                </button>
              );
            })}
          </div>
        </Reveal>

        <div
          id={`${panelId}-panel`}
          role="tabpanel"
          aria-labelledby={`${panelId}-tab-${filter}`}
          className="menu-list"
          itemScope
          itemType="https://schema.org/Menu"
        >
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
      </div>
    </section>
  );
}
