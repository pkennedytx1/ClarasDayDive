import { Reveal } from '@/components/Reveal';
import { SearchBar } from '@/components/SearchBar';
import { getSiteContent } from '@/lib/content';

export function AskClara() {
  const site = getSiteContent();

  return (
    <section id="ask-clara" className="section section--ask section--compact" aria-labelledby="ask-clara-heading">
      <div className="container ask-clara">
        <Reveal>
          <header className="ask-clara__head">
            <p className="eyebrow eyebrow--teal">{site.search.sectionEyebrow}</p>
            <h2 id="ask-clara-heading" className="display-lg ask-clara__title">
              {site.search.sectionTitle}
            </h2>
          </header>
        </Reveal>

        <Reveal delay={100}>
          <SearchBar
            placeholder={site.search.placeholder}
            buttonLabel={site.search.buttonLabel}
            suggestions={site.search.suggestions}
            responses={site.search.responses}
            fallback={site.search.fallback}
            centered
          />
          <p className="ask-clara__privacy body-muted">
            Ask Clara uses AI to answer from our menu and venue info. Messages are processed per our{' '}
            <a href="/privacy">Privacy Policy</a>.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
