import type { SiteContent } from './content';

type DirectionsSite = Pick<SiteContent, 'location' | 'mapsUrl' | 'seo'>;

function formatAddressQuery(site: DirectionsSite): string {
  return `${site.location.address}, ${site.location.city}`;
}

function googleMapsUrl(site: DirectionsSite): string {
  const query = encodeURIComponent(formatAddressQuery(site));
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
}

function geoMapsUrl(site: DirectionsSite): string {
  const { latitude, longitude } = site.seo.geo;
  const query = encodeURIComponent(formatAddressQuery(site));
  return `geo:${latitude},${longitude}?q=${query}`;
}

function isMobileDevice(): boolean {
  return (
    window.matchMedia('(pointer: coarse)').matches ||
    window.matchMedia('(hover: none)').matches
  );
}

/** Embedded browsers (Instagram, Facebook, etc.) block geo: / app deep links. */
function isInAppBrowser(): boolean {
  return /(FBAN|FBAV|Instagram|Twitter|LinkedInApp|Snapchat|Line\/|MicroMessenger|TikTok|BytedanceWebview)/i.test(
    navigator.userAgent,
  );
}

/**
 * Desktop → Google Maps web.
 * Mobile Safari/Chrome → geo: URI (respects the system default maps app on iOS).
 * In-app browsers → Google Maps HTTPS (geo: is usually blocked there).
 */
export function getDirectionsUrl(site: DirectionsSite): string {
  if (typeof window === 'undefined') return site.mapsUrl;

  if (!isMobileDevice()) return site.mapsUrl;

  if (isInAppBrowser()) return googleMapsUrl(site);

  return geoMapsUrl(site);
}
