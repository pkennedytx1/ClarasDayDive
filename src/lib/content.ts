/**
 * Content layer — all site copy and structured data lives in src/content/*.json today.
 * Swap fetchers here when you add a CMS or calendar sync; components stay the same.
 */

import site from '@/content/site.json';
import drinks from '@/content/drinks.json';
import events from '@/content/events.json';
import whatsHere from '@/content/whats-here.json';
import gallery from '@/content/gallery.json';
import faq from '@/content/faq.json';
import legal from '@/content/legal.json';
import { filterUpcomingEvents } from './events';

export type { SiteEvent } from './events';

export type SiteContent = typeof site;
export type DrinksContent = typeof drinks;
export type EventsContent = typeof events;
export type WhatsHereContent = typeof whatsHere;
export type GalleryItem = {
  src: string;
  srcThumb: string;
  width: number;
  height: number;
  alt: string;
  caption?: string;
};

export type GalleryContent = {
  eyebrow: string;
  title: string;
  items: GalleryItem[];
};
export type FaqContent = typeof faq;
export type LegalContent = typeof legal;
export type LegalPolicy = LegalContent['policies'][number];

export type NavLink = SiteContent['nav']['links'][number];

const GALLERY_NAV_LINK: NavLink = { label: 'Photos', href: '#gallery' };

export function getSiteContent(): SiteContent {
  return site;
}

export function getDrinksContent(): DrinksContent {
  return drinks;
}

export function getEventsContent(): EventsContent {
  return {
    ...events,
    items: filterUpcomingEvents(events.items),
  };
}

export function getWhatsHereContent(): WhatsHereContent {
  return whatsHere;
}

export function getGalleryContent(): GalleryContent {
  return gallery as GalleryContent;
}

export function getFaqContent(): FaqContent {
  return faq;
}

export function getLegalContent(): LegalContent {
  return legal;
}

export function getPolicyBySlug(slug: string): LegalPolicy | undefined {
  return legal.policies.find((p) => p.slug === slug);
}

/** Inserts Photos nav link after What's Here when the gallery has active items. */
export function getNavLinks(): NavLink[] {
  const links = [...site.nav.links];
  if (getGalleryContent().items.length === 0) return links;
  if (links.some((link) => link.href === '#gallery')) return links;

  const hereIndex = links.findIndex((link) => link.href === '#here');
  const insertAt = hereIndex >= 0 ? hereIndex + 1 : links.length;
  links.splice(insertAt, 0, GALLERY_NAV_LINK);
  return links;
}

export function getHomeSectionIds(): string[] {
  const ids = ['#top', '#ask-clara', '#drinks', '#here'];
  if (getGalleryContent().items.length > 0) ids.push('#gallery');
  ids.push('#events', '#faq', '#contact');
  return ids;
}
