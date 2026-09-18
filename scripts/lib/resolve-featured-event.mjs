/** @param {{ start: string; title: string }} event */
export function eventKey(event) {
  return `${event.start}|${event.title}`;
}

/**
 * Pick a single featured upcoming event and strip internal flags from all items.
 * @param {Array<{ featured?: boolean; [key: string]: unknown }>} upcoming
 * @returns {{ featured: object | null; items: object[] }}
 */
export function resolveFeaturedEvent(upcoming) {
  const flagged = upcoming.filter((event) => event.featured);
  const items = upcoming.map(stripFeaturedFlag);

  if (flagged.length === 0) {
    return { featured: null, items };
  }

  const pick = [...flagged].sort(
    (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime(),
  )[0];
  const featured = stripFeaturedFlag(pick);

  return { featured, items };
}

function stripFeaturedFlag(event) {
  const { featured: _featured, ...rest } = event;
  return rest;
}
