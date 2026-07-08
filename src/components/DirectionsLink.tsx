import { useEffect, useState, type ReactNode } from 'react';
import type { SiteContent } from '@/lib/content';
import { getDirectionsLinkOptions } from '@/lib/maps';

type DirectionsSite = Pick<SiteContent, 'location' | 'mapsUrl' | 'seo'>;

type DirectionsLinkProps = {
  site: DirectionsSite;
  className?: string;
  children: ReactNode;
};

export function DirectionsLink({ site, className, children }: DirectionsLinkProps) {
  const [link, setLink] = useState(() => getDirectionsLinkOptions(site));

  useEffect(() => {
    setLink(getDirectionsLinkOptions(site));
  }, [
    site.mapsUrl,
    site.location.address,
    site.location.city,
    site.seo.geo.latitude,
    site.seo.geo.longitude,
  ]);

  return (
    <a
      href={link.href}
      className={className}
      {...(link.openInNewTab
        ? { target: '_blank', rel: 'noopener noreferrer' }
        : {})}
    >
      {children}
      <span className="visually-hidden">
        {link.openInNewTab ? ' (opens in a new tab)' : ' (opens in maps)'}
      </span>
    </a>
  );
}
