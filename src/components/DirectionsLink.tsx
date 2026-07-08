import { useEffect, useState, type MouseEvent, type ReactNode } from 'react';
import type { SiteContent } from '@/lib/content';
import { getDirectionsLinkOptions, type DirectionsLinkOptions } from '@/lib/maps';

type DirectionsSite = Pick<SiteContent, 'location' | 'mapsUrl' | 'seo'>;

type DirectionsLinkProps = {
  site: DirectionsSite;
  className?: string;
  children: ReactNode;
};

export function DirectionsLink({ site, className, children }: DirectionsLinkProps) {
  const [link, setLink] = useState<DirectionsLinkOptions>(() =>
    getDirectionsLinkOptions(site),
  );

  useEffect(() => {
    setLink(getDirectionsLinkOptions(site));
  }, [
    site.mapsUrl,
    site.location.address,
    site.location.city,
    site.seo.geo.latitude,
    site.seo.geo.longitude,
  ]);

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (!link.geoUrl) return;

    event.preventDefault();
    window.location.assign(link.geoUrl);
  };

  return (
    <a
      href={link.href}
      className={className}
      onClick={handleClick}
      {...(link.openInNewTab
        ? { target: '_blank', rel: 'noopener noreferrer' }
        : {})}
    >
      {children}
      <span className="visually-hidden">
        {link.geoUrl
          ? ' (opens in your default maps app)'
          : link.openInNewTab
            ? ' (opens in a new tab)'
            : ' (opens in maps)'}
      </span>
    </a>
  );
}
