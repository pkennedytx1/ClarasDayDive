import { filterUpcomingEvents } from './filter-upcoming-events.mjs';
import { buildEventSchemaItem } from './event-schema.mjs';

function openingHoursSpecification(hoursStructured) {
  return hoursStructured.flatMap(({ days, opens, closes }) =>
    days.map((day) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: `https://schema.org/${day}`,
      opens,
      closes: closes === '0:00' ? '23:59' : closes,
    })),
  );
}

function menuSections(drinks) {
  const categories = [...new Set(drinks.items.map((d) => d.cat))];
  return categories.map((cat) => ({
    '@type': 'MenuSection',
    name: cat,
    hasMenuItem: drinks.items
      .filter((d) => d.cat === cat)
      .map((item) => {
        const menuItem = {
          '@type': 'MenuItem',
          name: item.name,
        };
        if (item.desc) menuItem.description = item.desc;
        if (item.price) {
          menuItem.offers = {
            '@type': 'Offer',
            price: item.price.replace('$', ''),
            priceCurrency: 'USD',
          };
        }
        return menuItem;
      }),
  }));
}

function sameAsLinks(site) {
  return [
    site.social?.instagram,
    site.social?.facebook,
    site.social?.tiktok,
    site.social?.googleBusiness,
    site.social?.googleMaps,
  ].filter((url) => typeof url === 'string' && url.trim().length > 0);
}

/**
 * @param {object} site
 * @param {object} drinks
 * @param {object} faq
 * @param {object} events
 */
export function buildJsonLd({ site, drinks, faq, events }) {
  const baseUrl = site.seo.siteUrl.replace(/\/$/, '');
  const upcoming = filterUpcomingEvents(events.items);
  const ogImage = site.seo.ogImage?.startsWith('http')
    ? site.seo.ogImage
    : `${baseUrl}${site.seo.ogImage ?? '/assets/scarf.jpg'}`;

  const localBusiness = {
    '@context': 'https://schema.org',
    '@type': 'BarOrPub',
    '@id': `${baseUrl}/#business`,
    name: site.name,
    description: site.seo.longDescription,
    url: `${baseUrl}/`,
    image: [
      ogImage,
      `${baseUrl}/assets/logo-combomark-color.png`,
      `${baseUrl}/assets/scarf.jpg`,
    ],
    logo: `${baseUrl}/assets/wordmark-color.png`,
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
    openingHoursSpecification: openingHoursSpecification(site.hoursStructured),
    sameAs: sameAsLinks(site),
    hasMap: site.mapsUrl,
    hasMenu: {
      '@type': 'Menu',
      '@id': `${baseUrl}/#menu`,
      name: "Clara's Day Dive drinks menu",
      hasMenuSection: menuSections(drinks),
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
      target: `${baseUrl}/ask-clara`,
      'query-input': 'required name=search_term_string',
    },
  };

  const faqPage = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': `${baseUrl}/faq`,
    mainEntity: faq.items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };

  const graphs = [localBusiness, webSite, faqPage];

  if (upcoming.length > 0) {
    graphs.push({
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      '@id': `${baseUrl}/events`,
      name: "Upcoming events at Clara's Day Dive",
      itemListElement: upcoming.map((event, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: buildEventSchemaItem(event, {
          baseUrl,
          siteName: site.name,
          eventImage: ogImage,
          location: site.location,
        }),
      })),
    });
  }

  return graphs;
}

export function buildLegalPageJsonLd(site, policy) {
  const baseUrl = site.seo.siteUrl.replace(/\/$/, '');
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${baseUrl}${policy.path}`,
        name: policy.title,
        description: policy.metaDescription,
        url: `${baseUrl}${policy.path}`,
        isPartOf: { '@id': `${baseUrl}/#website` },
        about: { '@id': `${baseUrl}/#business` },
        dateModified: policy.lastUpdated,
      },
    ],
  };
}
