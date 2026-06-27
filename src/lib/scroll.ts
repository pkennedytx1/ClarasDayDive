import type { MouseEvent } from 'react';

/** Smooth scroll to in-page sections, accounting for sticky nav height. Mobile-first offset. */
export function scrollToHash(hash: string): void {
  const id = hash.startsWith('#') ? hash : `#${hash}`;

  if (id === '#top' || id === '#') {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }

  const target = document.querySelector(id);
  if (!target) return;

  const nav = document.querySelector('.site-nav');
  const navHeight = nav?.getBoundingClientRect().height ?? 64;
  const offset = navHeight + 10;
  const top = target.getBoundingClientRect().top + window.scrollY - offset;

  window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
}

export function handleAnchorClick(
  event: MouseEvent<HTMLAnchorElement>,
  href: string,
  onNavigate?: () => void,
): void {
  if (!href.startsWith('#')) return;

  event.preventDefault();
  onNavigate?.();
  scrollToHash(href);
  history.pushState(null, '', href);
}
