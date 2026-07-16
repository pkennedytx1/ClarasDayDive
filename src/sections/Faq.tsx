import { Reveal } from '@/components/Reveal';
import { getFaqContent, getSiteContent } from '@/lib/content';

export function Faq() {
  const faq = getFaqContent();
  const site = getSiteContent();

  return (
    <section id="faq" className="section section--faq section--compact" aria-labelledby="faq-heading">
      <div className="container">
        <div className="section-rail">
          <Reveal>
            <header className="section-head section-head--brand">
              <div>
                <p className="eyebrow">{site.sections.faq.eyebrow}</p>
                <h2 id="faq-heading" className="display-lg">
                  {site.sections.faq.title}
                </h2>
              </div>
            </header>
          </Reveal>

          <div className="faq-list">
            {faq.items.map((item, i) => (
              <Reveal key={item.question} stagger={i} delay={40}>
                <article className="faq-item">
                  <h3 className="faq-item__q">{item.question}</h3>
                  <p className="faq-item__a">{item.answer}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
