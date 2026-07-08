import type { SiteEvent } from './events';

export function parseEventPrice(timeLabel: string): string {
  const match = timeLabel.match(/\$(\d+(?:\.\d{2})?)/);
  if (match) return match[1];
  if (/free/i.test(timeLabel)) return '0';
  return '0';
}

export function buildEventOffer(event: SiteEvent, baseUrl: string) {
  return {
    '@type': 'Offer',
    url: event.ticketUrl?.trim() || `${baseUrl}/events`,
    price: parseEventPrice(event.timeLabel),
    priceCurrency: 'USD',
    validFrom: event.start,
    availability: 'https://schema.org/InStock',
  };
}

interface BuildEventSchemaOptions {
  baseUrl: string;
  siteName: string;
  eventImage: string;
  location: {
    address: string;
    region: string;
    postalCode: string;
    country: string;
  };
}

export function buildEventSchemaItem(event: SiteEvent, options: BuildEventSchemaOptions) {
  const { baseUrl, siteName, eventImage, location } = options;
  return {
    '@type': 'Event',
    name: event.title,
    description: event.desc,
    startDate: event.start,
    endDate: event.end,
    url: event.ticketUrl?.trim() || `${baseUrl}/events`,
    image: [eventImage],
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    eventStatus: 'https://schema.org/EventScheduled',
    isAccessibleForFree: /free/i.test(event.timeLabel),
    performer: {
      '@type': 'Organization',
      name: siteName,
      '@id': `${baseUrl}/#business`,
    },
    location: {
      '@type': 'Place',
      name: siteName,
      address: {
        '@type': 'PostalAddress',
        streetAddress: location.address,
        addressLocality: 'Austin',
        addressRegion: location.region,
        postalCode: location.postalCode,
        addressCountry: location.country,
      },
    },
    organizer: { '@id': `${baseUrl}/#business` },
    offers: buildEventOffer(event, baseUrl),
  };
}
