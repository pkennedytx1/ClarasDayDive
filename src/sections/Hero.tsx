import { useEffect, useState } from 'react';
import { getSiteContent } from '@/lib/content';
import { handleAnchorClick } from '@/lib/scroll';

export function Hero() {
  const site = getSiteContent();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setReady(true));
  }, []);

  return (
    <section id="top" className={`hero${ready ? ' is-ready' : ''}`} aria-labelledby="hero-heading">
      <div className="container hero__grid">
        <div className="hero__copy">
          <div className="hero__eyebrow-wrap">
            <span className="hero__rule" aria-hidden="true" />
            <p className="hero__eyebrow">{site.location.eyebrow}</p>
          </div>

          <h1 id="hero-heading" className="hero__headline">
            Dive in for a <em className="hero__accent">day</em> drink.
          </h1>

          <p className="hero__lead">{site.description}</p>

          <p className="hero__meta">{site.hero.meta}</p>
        </div>

        <div className="hero__visual">
          <figure className="hero__frame">
            <div className="hero__frame-bg">
              <img
                src="/assets/logo-symbol-color.png"
                alt="Two penguins diving into a coupe glass"
                className="hero__symbol"
                width={640}
                height={640}
                fetchPriority="high"
                decoding="async"
              />
            </div>
            <figcaption>
              <a
                href="#ask-clara"
                className="hero__frame-cta"
                onClick={(e) => handleAnchorClick(e, '#ask-clara')}
              >
                Dive in for a day drink
              </a>
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}
