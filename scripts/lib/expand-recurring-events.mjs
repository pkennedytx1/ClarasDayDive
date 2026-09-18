/** @typedef {{ start: string; end: string; month: string; day: string; tag: string; title: string; timeLabel: string; desc: string; ticketUrl?: string }} SiteEventItem */

export const MAX_WEEKLY_OCCURRENCES = 26;

export function parseLocalDatetime(str) {
  const m = String(str)
    .trim()
    .match(/^(\d{4})-(\d{2})-(\d{2})\s+(\d{1,2}):(\d{2})$/);
  if (!m) throw new Error(`Invalid datetime "${str}" — expected YYYY-MM-DD HH:MM`);
  return {
    year: Number(m[1]),
    month: Number(m[2]),
    day: Number(m[3]),
    hour: Number(m[4]),
    minute: Number(m[5]),
  };
}

export function parseRecurrenceUntil(str) {
  const m = String(str)
    .trim()
    .match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) throw new Error(`Invalid recurrence_until "${str}" — expected YYYY-MM-DD`);
  return { year: Number(m[1]), month: Number(m[2]), day: Number(m[3]) };
}

export function formatYmd({ year, month, day }) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${year}-${pad(month)}-${pad(day)}`;
}

export function compareYmd(a, b) {
  if (a.year !== b.year) return a.year - b.year;
  if (a.month !== b.month) return a.month - b.month;
  return a.day - b.day;
}

export function addCalendarDays(y, m, d, days) {
  const dt = new Date(Date.UTC(y, m - 1, d + days));
  return { year: dt.getUTCFullYear(), month: dt.getUTCMonth() + 1, day: dt.getUTCDate() };
}

/**
 * Validate recurrence columns for one Events row.
 * @returns {{ type: 'oneoff' } | { type: 'weekly'; until: string } | null} null when validation failed (errors pushed)
 */
export function getRecurrenceConfig(row, startLocal, errors) {
  const recurrence = String(row.recurrence ?? '').trim().toLowerCase();
  const untilRaw = String(row.recurrence_until ?? '').trim();

  if (!recurrence) {
    if (untilRaw) {
      errors.push(
        `Events row ${row._row}: recurrence_until should be empty when recurrence is not set`,
      );
      return null;
    }
    return { type: 'oneoff' };
  }

  if (recurrence !== 'weekly') {
    errors.push(
      `Events row ${row._row}: recurrence must be empty or "weekly" (got "${recurrence}")`,
    );
    return null;
  }

  if (!untilRaw) {
    errors.push(`Events row ${row._row}: recurrence_until required when recurrence is weekly`);
    return null;
  }

  let until;
  try {
    until = parseRecurrenceUntil(untilRaw);
  } catch (err) {
    errors.push(`Events row ${row._row}: ${err.message}`);
    return null;
  }

  if (compareYmd(until, startLocal) < 0) {
    errors.push(`Events row ${row._row}: recurrence_until must be on or after start date`);
    return null;
  }

  return { type: 'weekly', until: untilRaw.trim() };
}

/**
 * Expand a weekly series into individual occurrences (inclusive of start date).
 * @param {Omit<SiteEventItem, 'start' | 'end' | 'month' | 'day'>} baseFields
 * @param {{ year: number; month: number; day: number; hour: number; minute: number }} startLocal
 * @param {{ hour: number; minute: number }} endLocal
 * @param {string} recurrenceUntil YYYY-MM-DD
 * @param {{ parseChicagoDatetime: (s: string) => string; deriveMonthDay: (iso: string) => { month: string; day: string } }} helpers
 * @returns {SiteEventItem[]}
 */
export function expandWeeklyEvent(baseFields, startLocal, endLocal, recurrenceUntil, helpers) {
  const { parseChicagoDatetime, deriveMonthDay } = helpers;
  const until = parseRecurrenceUntil(recurrenceUntil);
  const pad = (n) => String(n).padStart(2, '0');
  const padTime = (n) => String(n); // hour may be 1-2 digits in input; parseChicagoDatetime accepts both

  const occurrences = [];
  let cursor = { year: startLocal.year, month: startLocal.month, day: startLocal.day };

  while (occurrences.length < MAX_WEEKLY_OCCURRENCES) {
    if (compareYmd(cursor, until) > 0) break;

    const dateStr = formatYmd(cursor);
    const start = parseChicagoDatetime(
      `${dateStr} ${padTime(startLocal.hour)}:${pad(startLocal.minute)}`,
    );
    const end = parseChicagoDatetime(`${dateStr} ${padTime(endLocal.hour)}:${pad(endLocal.minute)}`);
    const { month, day } = deriveMonthDay(start);

    occurrences.push({
      ...baseFields,
      start,
      end,
      month,
      day,
    });

    cursor = addCalendarDays(cursor.year, cursor.month, cursor.day, 7);
  }

  return occurrences;
}
