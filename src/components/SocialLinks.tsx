import { Icon } from '@/components/Icon';
import { getSocialLinks, type SiteSocial } from '@/lib/social';

interface SocialLinksProps {
  social: SiteSocial;
  className?: string;
}

export function SocialLinks({ social, className }: SocialLinksProps) {
  const links = getSocialLinks(social);
  if (!links.length) return null;

  return (
    <nav className={className ?? 'social-links'} aria-label="Social media">
      {links.map((link) => (
        <a
          key={link.platform}
          href={link.url}
          className="social-links__item"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Icon name={link.platform} size={22} aria-hidden="true" />
          <span className="visually-hidden">{link.label} (opens in new tab)</span>
        </a>
      ))}
    </nav>
  );
}
