import { Reveal } from '@/components/Reveal';
import { getFaqContent } from '@/lib/content';

export function Faq() {
  const faq = getFaqContent();

  return (
    <section id="faq" className="section section--faq section--compact" aria-labelledby="faq-heading">
      <div className="container">
        <Reveal>
          <header className="section-head section-head--brand">
            <div>
              <p className="eyebrow">Good to know</p>
              <h2 id="faq-heading" className="display-lg">
                Questions, answered
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
    </section>
  );
}
