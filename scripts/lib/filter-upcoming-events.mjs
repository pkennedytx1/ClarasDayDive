/**
 * Drop events whose end time has passed. Used at sync + SEO/knowledge build.
 * @param {Array<{ start: string; end: string }>} items
 * @param {Date} [now]
 */
export function filterUpcomingEvents(items, now = new Date()) {
  const cutoff = now.getTime();
  return items
    .filter((item) => new Date(item.end).getTime() > cutoff)
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
}
