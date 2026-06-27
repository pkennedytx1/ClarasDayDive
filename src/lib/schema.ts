import site from '@/content/site.json';
import drinks from '@/content/drinks.json';
import events from '@/content/events.json';
import faq from '@/content/faq.json';

const baseUrl = site.seo.siteUrl.replace(/\/$/, '');

function openingHoursSpecification() {
  return site.hoursStructured.flatMap(({ days, opens, closes }) =>
    days.map((day) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: `https://schema.org/${day}`,
      opens,
      closes,
    })),
  );
}

export function buildJsonLd() {
  const localBusiness = {
    '@context': 'https://schema.org',
    '@type': 'BarOrPub',
    '@id': `${baseUrl}/#business`,
    name: site.name,
    description: site.seo.longDescription,
    url: `${baseUrl}/`,
    image: `${baseUrl}/assets/logo-combomark-color.png`,
    logo: `${baseUrl}/assets/wordmark-color.png`,
    telephone: site.contact.phone,
    email: site.contact.email,
    priceRange: site.seo.priceRange,
    servesCuisine: 'Bar food',
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
    sameAs: [site.social.instagram],
    hasMenu: {
      '@type': 'Menu',
      '@id': `${baseUrl}/#menu`,
      name: "Clara's Day Dive drinks menu",
      hasMenuSection: {
        '@type': 'MenuSection',
        name: 'Cocktails',
        hasMenuItem: drinks.items.map((item) => ({
          '@type': 'MenuItem',
          name: item.name,
          description: item.desc,
          offers: {
            '@type': 'Offer',
            price: item.price.replace('$', ''),
            priceCurrency: 'USD',
          },
        })),
      },
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
      target: `${baseUrl}/?q={search_term_string}`,
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

  const eventList = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    '@id': `${baseUrl}/#events`,
    name: 'Upcoming events at Clara\'s Day Dive',
    itemListElement: events.items.map((event, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Event',
        name: event.title,
        description: event.desc,
        startDate: event.start,
        endDate: event.end,
        eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
        eventStatus: 'https://schema.org/EventScheduled',
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
      },
    })),
  };

  return [localBusiness, webSite, faqPage, eventList];
}

export function getSeoMeta() {
  return {
    title: site.seo.title,
    description: site.seo.description,
    keywords: site.seo.keywords.join(', '),
    siteUrl: baseUrl,
    ogImage: `${baseUrl}/assets/logo-combomark-color.png`,
  };
}
