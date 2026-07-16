import { Reveal } from '@/components/Reveal';
import { WhatsHereHoursPill } from '@/components/WhatsHereHoursPill';
import { getSiteContent, getWhatsHereContent } from '@/lib/content';

export function WhatsHere() {
  const whatsHere = getWhatsHereContent();
  const site = getSiteContent();

  return (
    <section id="here" className="section section--here section--compact" aria-labelledby="here-heading">
      <div className="container">
        <div className="section-rail">
        <Reveal>
          <header className="section-head section-head--brand">
            <div>
              <p className="eyebrow eyebrow--teal">{site.sections.whatsHere.eyebrow}</p>
              <h2 id="here-heading" className="display-lg">
                {site.sections.whatsHere.title}
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
                  {t.hours ? <WhatsHereHoursPill hours={t.hours} vendorName={t.title} /> : null}
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
                          <span className="visually-hidden"> (opens in new tab)</span>
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
                          <span className="visually-hidden"> (opens in new tab)</span>
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
      </div>
    </section>
  );
}
