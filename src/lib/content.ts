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
import { filterUpcomingEvents, type SiteEvent } from './events';

export type { SiteEvent } from './events';

export type SiteContent = typeof site;
export type DrinksContent = typeof drinks;
export type DrinkItem = {
  cat: string;
  name: string;
  desc?: string;
  price?: string;
  badge?: string;
};
export type EventsContent = {
  items: SiteEvent[];
  hostNote: string;
};
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

const GALLERY_NAV_LINK: NavLink = { label: 'Gallery', href: '/gallery' };

export function getSiteContent(): SiteContent {
  return site;
}

export function getDrinksContent(): { categories: string[]; items: DrinkItem[] } {
  return drinks as { categories: string[]; items: DrinkItem[] };
}

export function getEventsContent(): EventsContent {
  const data = events as EventsContent;
  return {
    ...data,
    items: filterUpcomingEvents(data.items),
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

/** Inserts Gallery nav link after Plan an event when the gallery has active items. */
export function getNavLinks(): NavLink[] {
  const links = [...site.nav.links];
  if (getGalleryContent().items.length === 0) return links;
  if (links.some((link) => link.href === '/gallery')) return links;

  const contactIndex = links.findIndex((link) => link.href === '/contact');
  const insertAt = contactIndex >= 0 ? contactIndex + 1 : links.length;
  links.splice(insertAt, 0, GALLERY_NAV_LINK);
  return links;
}

export function getHomeSectionIds(): string[] {
  const ids = ['#top', '#ask-clara', '#drinks', '#here', '#events', '#faq', '#contact'];
  if (getGalleryContent().items.length > 0) ids.push('#gallery');
  return ids;
}