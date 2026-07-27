import { DirectionsLink } from '@/components/DirectionsLink';
import { LegalLinks } from '@/components/LegalLinks';
import { SocialLinks } from '@/components/SocialLinks';
import { getSiteContent } from '@/lib/content';

export function Footer() {
  const site = getSiteContent();

  return (
    <footer className="site-footer">
      <div className="container site-footer__grid">
        <div className="site-footer__brand-col">
          <div className="site-footer__brand">
            <img
              src="/assets/wordmark-color.png"
              alt="Clara's Day Dive"
              className="site-footer__wordmark"
              width={280}
              height={72}
              loading="lazy"
              decoding="async"
            />
          </div>
          <p className="body-muted site-footer__tagline">{site.footerTagline}</p>
        </div>

        <div>
          <h2 className="site-footer__label">Hours</h2>
          {site.hours.map((h) => (
            <p key={h} className="site-footer__line">
              {h}
            </p>
          ))}
        </div>

        <div itemScope itemType="https://schema.org/PostalAddress">
          <h2 className="site-footer__label">Find us</h2>
          <p className="site-footer__line" itemProp="streetAddress">
            {site.location.address}
          </p>
          <p className="site-footer__line" itemProp="addressLocality">
            {site.location.city}
          </p>
          <DirectionsLink site={site} className="site-footer__directions">
            Get directions →
          </DirectionsLink>
        </div>

        <div>
          <h2 className="site-footer__label">Legal</h2>
          <LegalLinks />
        </div>
      </div>

      <div className="site-footer__social-row">
        <SocialLinks social={site.social} className="social-links social-links--footer" />
      </div>

      <div className="site-footer__bottom">
        <p className="site-footer__legal">
          © {new Date().getFullYear()} Clara's Day Dive · Please drink responsibly · 21+
        </p>
        <p className="site-footer__credit">
          Built with <span aria-label="love">♥</span> by Praxis Dev Lab
        </p>
      </div>
    </footer>
  );
}
