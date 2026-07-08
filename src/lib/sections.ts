/** Path-based home section routes (History API). Element ids stay on sections for scroll targets. */
export const HOME_ROUTE_PATHS = [
  '/',
  '/drinks',
  '/here',
  '/gallery',
  '/events',
  '/faq',
  '/contact',
  '/ask-clara',
] as const;

export type HomeRoutePath = (typeof HOME_ROUTE_PATHS)[number];

export const SITEMAP_SECTION_PATHS = [
  '/drinks',
  '/here',
  '/gallery',
  '/events',
  '/faq',
  '/contact',
] as const;

/** Old hash URLs → clean paths (shared links, bookmarks). */
export const LEGACY_HASH_TO_PATH: Record<string, HomeRoutePath> = {
  '#top': '/',
  '#drinks': '/drinks',
  '#here': '/here',
  '#gallery': '/gallery',
  '#events': '/events',
  '#faq': '/faq',
  '#contact': '/contact',
  '#ask-clara': '/ask-clara',
};

export function pathToSectionId(pathname: string): string | null {
  if (pathname === '/') return 'top';
  const sectionId = pathname.replace(/^\//, '');
  const valid = ['drinks', 'here', 'gallery', 'events', 'faq', 'contact', 'ask-clara'];
  return valid.includes(sectionId) ? sectionId : null;
}

export function sectionIdToPath(sectionId: string): HomeRoutePath {
  if (sectionId === 'top') return '/';
  return `/${sectionId}` as HomeRoutePath;
}

export function isHomeRoutePath(pathname: string): pathname is HomeRoutePath {
  return (HOME_ROUTE_PATHS as readonly string[]).includes(pathname);
}
