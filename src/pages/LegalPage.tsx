import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LegalHeader } from '@/components/LegalHeader';
import { LegalLinks } from '@/components/LegalLinks';
import { SeoHead } from '@/components/SeoHead';
import { getLegalContent, getPolicyBySlug, getSiteContent } from '@/lib/content';
import type { LegalPolicy } from '@/lib/content';

const SLUG_BY_PATH: Record<string, string> = {
  '/privacy': 'privacy',
  '/terms': 'terms',
  '/accessibility': 'accessibility',
  '/cookies': 'cookies',
};

function PolicyBody({ policy }: { policy: LegalPolicy }) {
  return (
    <article className="legal-page__body">
      {policy.sections.map((section) => (
        <section key={section.heading} className="legal-section">
          <h2 className="legal-section__heading">{section.heading}</h2>
          {section.paragraphs?.map((p) => (
            <p key={p.slice(0, 40)} className="legal-section__p">
              {p}
            </p>
          ))}
          {section.list && (
            <ul className="legal-section__list">
              {section.list.map((item) => (
                <li key={item.slice(0, 40)}>{item}</li>
              ))}
            </ul>
          )}
        </section>
      ))}
    </article>
  );
}

export function LegalPage() {
  const { pathname } = useLocation();
  const slug = SLUG_BY_PATH[pathname];
  const policy = slug ? getPolicyBySlug(slug) : undefined;
  const site = getSiteContent();
  const allPolicies = getLegalContent().policies;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  if (!policy) {
    return (
      <>
        <SeoHead title="Page not found" description="The requested page could not be found." path="/404" includeSchema={false} />
        <LegalHeader />
        <main id="main" className="legal-page">
          <div className="container legal-page__content">
            <h1 className="display-lg">Page not found</h1>
            <p className="lead">That page doesn't exist.</p>
            <Link to="/" className="btn btn--primary btn--lg">
              Back to home
            </Link>
          </div>
        </main>
      </>
    );
  }

  const formattedDate = new Date(policy.lastUpdated).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <>
      <SeoHead
        title={`${policy.title} — ${site.name}`}
        description={policy.metaDescription}
        path={policy.path}
        includeSchema={false}
      />
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <LegalHeader />
      <main id="main" className="legal-page">
        <div className="container legal-page__content">
          <header className="legal-page__head">
            <p className="eyebrow">Legal</p>
            <h1 className="display-lg">{policy.title}</h1>
            <p className="legal-page__updated">Last updated {formattedDate}</p>
          </header>

          <PolicyBody policy={policy} />

          <aside className="legal-page__aside" aria-label="Other policies">
            <h2 className="legal-page__aside-title">Other policies</h2>
            <ul className="legal-page__nav">
              {allPolicies
                .filter((p) => p.slug !== policy.slug)
                .map((p) => (
                  <li key={p.slug}>
                    <Link to={p.path}>{p.title}</Link>
                  </li>
                ))}
            </ul>
          </aside>
        </div>
      </main>
      <footer className="legal-page__footer">
        <div className="container">
          <LegalLinks inline />
          <p className="site-footer__legal">
            © {new Date().getFullYear()} {site.name} · Please drink responsibly · 21+
          </p>
        </div>
      </footer>
    </>
  );
}
