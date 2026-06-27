/**
 * Content layer — all site copy and structured data lives in src/content/*.json today.
 * Swap fetchers here when you add a CMS or calendar sync; components stay the same.
 */

import site from '@/content/site.json';
import drinks from '@/content/drinks.json';
import events from '@/content/events.json';
import whatsHere from '@/content/whats-here.json';
import faq from '@/content/faq.json';
import legal from '@/content/legal.json';

export type { SiteEvent } from './events';

export type SiteContent = typeof site;
export type DrinksContent = typeof drinks;
export type EventsContent = typeof events;
export type WhatsHereContent = typeof whatsHere;
export type FaqContent = typeof faq;
export type LegalContent = typeof legal;
export type LegalPolicy = LegalContent['policies'][number];

export function getSiteContent(): SiteContent {
  return site;
}

export function getDrinksContent(): DrinksContent {
  return drinks;
}

export function getEventsContent(): EventsContent {
  return events;
}

export function getWhatsHereContent(): WhatsHereContent {
  return whatsHere;
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
