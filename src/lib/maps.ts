import type { SiteContent } from './content';

type DirectionsSite = Pick<SiteContent, 'location' | 'mapsUrl' | 'seo'>;

function formatAddressQuery(site: DirectionsSite): string {
  return `${site.location.address}, ${site.location.city}`;
}

function isIOS(): boolean {
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  );
}

function isMobileDevice(): boolean {
  return (
    window.matchMedia('(pointer: coarse)').matches ||
    window.matchMedia('(hover: none)').matches
  );
}

/** Desktop → Google Maps web. Mobile → Apple Maps on iOS, Google Maps elsewhere. */
export function getDirectionsUrl(site: DirectionsSite): string {
  if (typeof window === 'undefined') return site.mapsUrl;

  if (!isMobileDevice()) return site.mapsUrl;

  const query = encodeURIComponent(formatAddressQuery(site));
  const { latitude, longitude } = site.seo.geo;

  if (isIOS()) {
    return `https://maps.apple.com/?ll=${latitude},${longitude}&q=${query}`;
  }

  return `https://www.google.com/maps/search/?api=1&query=${query}`;
}
