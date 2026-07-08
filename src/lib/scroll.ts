/** Smooth scroll to in-page sections, accounting for sticky nav height. Mobile-first offset. */
export function scrollToSection(sectionId: string): void {
  if (sectionId === 'top') {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }

  const target = document.querySelector(`#${CSS.escape(sectionId)}`);
  if (!target) return;

  const nav = document.querySelector('.site-nav');
  const navHeight = nav?.getBoundingClientRect().height ?? 64;
  const offset = navHeight + 10;
  const top = target.getBoundingClientRect().top + window.scrollY - offset;

  window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
}

/** @deprecated Prefer path routes; kept for skip links and legacy hash fragments. */
export function scrollToHash(hash: string): void {
  const id = hash.startsWith('#') ? hash.slice(1) : hash;
  if (id === '' || id === 'top') {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }
  scrollToSection(id);
}
