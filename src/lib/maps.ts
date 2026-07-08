import type { SiteContent } from './content';

type DirectionsSite = Pick<SiteContent, 'location' | 'mapsUrl' | 'seo'>;

export type DirectionsLinkOptions = {
  /** Visible href (HTTPS fallback; safe for long-press / copy). */
  href: string;
  /** Android-only: geo: URI handed to the OS default maps app on click. */
  geoUrl?: string;
  openInNewTab: boolean;
};

function formatAddressQuery(site: DirectionsSite): string {
  return `${site.location.address}, ${site.location.city}`;
}

function googleMapsUrl(site: DirectionsSite): string {
  const query = encodeURIComponent(formatAddressQuery(site));
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
}

/** Android respects this and opens the user's default maps app (Google, Waze, etc.). */
function geoMapsUrl(site: DirectionsSite): string {
  const query = encodeURIComponent(formatAddressQuery(site));
  return `geo:0,0?q=${query}`;
}

function isMobileDevice(): boolean {
  return (
    window.matchMedia('(pointer: coarse)').matches ||
    window.matchMedia('(hover: none)').matches
  );
}

function isAndroid(): boolean {
  return /Android/i.test(navigator.userAgent);
}

/**
 * Desktop → Google Maps web (new tab).
 * Android → geo: on tap (default maps app).
 * iOS → Google Maps HTTPS (Safari does not support geo: links at all).
 */
export function getDirectionsLinkOptions(site: DirectionsSite): DirectionsLinkOptions {
  if (typeof window === 'undefined') {
    return { href: site.mapsUrl, openInNewTab: true };
  }

  if (!isMobileDevice()) {
    return { href: site.mapsUrl, openInNewTab: true };
  }

  if (isAndroid()) {
    return {
      href: googleMapsUrl(site),
      geoUrl: geoMapsUrl(site),
      openInNewTab: false,
    };
  }

  // iOS Safari rejects geo: with "address is invalid" — no web workaround for system default.
  return {
    href: googleMapsUrl(site),
    openInNewTab: false,
  };
}

/** @deprecated Use getDirectionsLinkOptions */
export function getDirectionsUrl(site: DirectionsSite): string {
  return getDirectionsLinkOptions(site).href;
}

export function openDirections(site: DirectionsSite): void {
  const options = getDirectionsLinkOptions(site);

  if (options.geoUrl) {
    window.location.assign(options.geoUrl);
    return;
  }

  if (options.openInNewTab) {
    window.open(options.href, '_blank', 'noopener,noreferrer');
    return;
  }

  window.location.assign(options.href);
}
