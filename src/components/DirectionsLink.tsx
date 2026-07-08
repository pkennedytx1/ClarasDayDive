import { useEffect, useState, type ReactNode } from 'react';
import type { SiteContent } from '@/lib/content';
import { getDirectionsUrl } from '@/lib/maps';

type DirectionsSite = Pick<SiteContent, 'location' | 'mapsUrl' | 'seo'>;

type DirectionsLinkProps = {
  site: DirectionsSite;
  className?: string;
  children: ReactNode;
};

export function DirectionsLink({ site, className, children }: DirectionsLinkProps) {
  const [href, setHref] = useState(site.mapsUrl);

  useEffect(() => {
    setHref(getDirectionsUrl(site));
  }, [
    site.mapsUrl,
    site.location.address,
    site.location.city,
    site.seo.geo.latitude,
    site.seo.geo.longitude,
  ]);

  return (
    <a href={href} className={className} target="_blank" rel="noopener noreferrer">
      {children}
      <span className="visually-hidden"> (opens in a new tab)</span>
    </a>
  );
}
