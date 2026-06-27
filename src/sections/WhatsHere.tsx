import { Reveal } from '@/components/Reveal';
import { getWhatsHereContent } from '@/lib/content';

export function WhatsHere() {
  const whatsHere = getWhatsHereContent();

  return (
    <section id="here" className="section section--here section--compact" aria-labelledby="here-heading">
      <div className="container">
        <Reveal>
          <header className="section-head section-head--brand">
            <div>
              <p className="eyebrow eyebrow--teal">More than a bar</p>
              <h2 id="here-heading" className="display-lg">
                What's here
              </h2>
            </div>
          </header>
        </Reveal>

        <div className="here-grid">
          {whatsHere.items.map((t, i) => (
            <Reveal key={t.title} stagger={i} delay={60}>
              <article className="here-item">
                <div className="here-item__content">
                  <p className="eyebrow">{t.tag}</p>
                  <h3 className="here-item__title">{t.title}</h3>
                  {t.hours && <p className="here-item__hours">{t.hours}</p>}
                  <p className="here-item__body">{t.body}</p>
                  {(t.websiteUrl || t.orderUrl) && (
                    <div className="here-item__links">
                      {t.websiteUrl && (
                        <a
                          href={t.websiteUrl}
                          className="here-item__link"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Visit website →
                        </a>
                      )}
                      {t.orderUrl && (
                        <a
                          href={t.orderUrl}
                          className="here-item__link here-item__link--order"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Order now
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
