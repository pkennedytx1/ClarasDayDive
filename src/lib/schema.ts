import site from '@/content/site.json';
import drinks from '@/content/drinks.json';
import faq from '@/content/faq.json';
import { getEventsContent } from './content';

const baseUrl = site.seo.siteUrl.replace(/\/$/, '');
const ogImagePath = site.seo.ogImage ?? '/assets/scarf.jpg';
const ogImageUrl = ogImagePath.startsWith('http') ? ogImagePath : `${baseUrl}${ogImagePath}`;

function normalizeCloseTime(closes: string): string {
  return closes === '0:00' ? '23:59' : closes;
}

function openingHoursSpecification() {
  return site.hoursStructured.flatMap(({ days, opens, closes }) =>
    days.map((day) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: `https://schema.org/${day}`,
      opens,
      closes: normalizeCloseTime(closes),
    })),
  );
}

function sameAsLinks(): string[] {
  return [
    site.social.instagram,
    site.social.facebook,
    site.social.tiktok,
    site.social.googleBusiness,
    site.social.googleMaps,
  ].filter((url): url is string => Boolean(url?.trim()));
}

function menuSections() {
  const categories = [...new Set(drinks.items.map((d) => d.cat))];
  return categories.map((cat) => ({
    '@type': 'MenuSection',
    name: cat,
    hasMenuItem: drinks.items
      .filter((d) => d.cat === cat)
      .map((item) => ({
        '@type': 'MenuItem',
        name: item.name,
        description: item.desc,
        offers: {
          '@type': 'Offer',
          price: item.price.replace('$', ''),
          priceCurrency: 'USD',
        },
      })),
  }));
}

function eventOffer(event: ReturnType<typeof getEventsContent>['items'][number]) {
  if (event.ticketUrl) {
    return { '@type': 'Offer', url: event.ticketUrl, availability: 'https://schema.org/InStock' };
  }
  if (/free/i.test(event.timeLabel)) {
    return { '@type': 'Offer', price: '0', priceCurrency: 'USD', availability: 'https://schema.org/InStock' };
  }
  return undefined;
}

export function buildJsonLd() {
  const events = getEventsContent();

  const localBusiness = {
    '@context': 'https://schema.org',
    '@type': 'BarOrPub',
    '@id': `${baseUrl}/#business`,
    name: site.name,
    description: site.seo.longDescription,
    url: `${baseUrl}/`,
    image: [ogImageUrl, `${baseUrl}/assets/logo-combomark-color.png`, `${baseUrl}/assets/scarf.jpg`],
    logo: `${baseUrl}/assets/wordmark-color.png`,
    telephone: site.contact.phone,
    email: site.contact.email,
    priceRange: site.seo.priceRange,
    servesCuisine: 'Bar food',
    petsAllowed: true,
    acceptsReservations: true,
    address: {
      '@type': 'PostalAddress',
      streetAddress: site.location.address,
      addressLocality: 'Austin',
      addressRegion: site.location.region,
      postalCode: site.location.postalCode,
      addressCountry: site.location.country,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: site.seo.geo.latitude,
      longitude: site.seo.geo.longitude,
    },
    openingHoursSpecification: openingHoursSpecification(),
    sameAs: sameAsLinks(),
    hasMap: site.mapsUrl,
    hasMenu: {
      '@type': 'Menu',
      '@id': `${baseUrl}/#menu`,
      name: "Clara's Day Dive drinks menu",
      hasMenuSection: menuSections(),
    },
  };

  const webSite = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${baseUrl}/#website`,
    name: site.name,
    url: `${baseUrl}/`,
    description: site.seo.description,
    publisher: { '@id': `${baseUrl}/#business` },
    potentialAction: {
      '@type': 'SearchAction',
      target: `${baseUrl}/#ask-clara`,
      'query-input': 'required name=search_term_string',
    },
  };

  const faqPage = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': `${baseUrl}/#faq`,
    mainEntity: faq.items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };

  const eventList =
    events.items.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          '@id': `${baseUrl}/#events`,
          name: "Upcoming events at Clara's Day Dive",
          itemListElement: events.items.map((event, index) => {
            const offer = eventOffer(event);
            const item: Record<string, unknown> = {
              '@type': 'Event',
              name: event.title,
              description: event.desc,
              startDate: event.start,
              endDate: event.end,
              eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
              eventStatus: 'https://schema.org/EventScheduled',
              isAccessibleForFree: /free/i.test(event.timeLabel),
              location: {
                '@type': 'Place',
                name: site.name,
                address: {
                  '@type': 'PostalAddress',
                  streetAddress: site.location.address,
                  addressLocality: 'Austin',
                  addressRegion: site.location.region,
                  postalCode: site.location.postalCode,
                  addressCountry: site.location.country,
                },
              },
              organizer: { '@id': `${baseUrl}/#business` },
            };
            if (offer) item.offers = offer;
            if (event.ticketUrl) item.url = event.ticketUrl;
            return {
              '@type': 'ListItem',
              position: index + 1,
              item,
            };
          }),
        }
      : null;

  return [localBusiness, webSite, faqPage, eventList].filter(Boolean);
}

export function getSeoMeta() {
  return {
    title: site.seo.title,
    description: site.seo.description,
    keywords: site.seo.keywords.join(', '),
    siteUrl: baseUrl,
    ogImage: ogImageUrl,
  };
}
