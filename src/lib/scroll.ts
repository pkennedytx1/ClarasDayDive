const NAV_SHEET_CLOSE_MS = 440;

let deferScrollForNavClose = false;

/** Call before route change when closing the mobile nav sheet. */
export function markScrollAfterNavClose(): void {
  deferScrollForNavClose = true;
}

function shouldDeferForNavClose(): boolean {
  if (!deferScrollForNavClose) return false;
  deferScrollForNavClose = false;
  return window.matchMedia('(max-width: 768px)').matches;
}

function runScrollToSection(sectionId: string): void {
  if (sectionId === 'top') {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }

  const target = document.querySelector(`#${CSS.escape(sectionId)}`);
  if (!(target instanceof HTMLElement)) return;

  target.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/** Smooth scroll to in-page sections; respects section scroll-margin for the fixed nav. */
export function scrollToSection(sectionId: string): void {
  if (shouldDeferForNavClose()) {
    window.setTimeout(() => runScrollToSection(sectionId), NAV_SHEET_CLOSE_MS);
    return;
  }

  requestAnimationFrame(() => runScrollToSection(sectionId));
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
