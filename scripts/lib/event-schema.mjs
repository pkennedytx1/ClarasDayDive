/** @param {string} timeLabel */
export function parseEventPrice(timeLabel) {
  const match = timeLabel.match(/\$(\d+(?:\.\d{2})?)/);
  if (match) return match[1];
  if (/free/i.test(timeLabel)) return '0';
  return '0';
}

/**
 * @param {object} event
 * @param {string} baseUrl
 */
export function buildEventOffer(event, baseUrl) {
  return {
    '@type': 'Offer',
    url: event.ticketUrl?.trim() || `${baseUrl}/#events`,
    price: parseEventPrice(event.timeLabel),
    priceCurrency: 'USD',
    validFrom: event.start,
    availability: 'https://schema.org/InStock',
  };
}

/**
 * @param {object} event
 * @param {object} options
 * @param {string} options.baseUrl
 * @param {string} options.siteName
 * @param {string} options.eventImage
 * @param {object} options.location
 */
export function buildEventSchemaItem(event, { baseUrl, siteName, eventImage, location }) {
  return {
    '@type': 'Event',
    name: event.title,
    description: event.desc,
    startDate: event.start,
    endDate: event.end,
    url: event.ticketUrl?.trim() || `${baseUrl}/#events`,
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
