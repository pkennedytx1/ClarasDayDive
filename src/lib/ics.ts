import type { SiteEvent } from './events';
import { toUtcCalendarDatetime } from './events';

function escapeIcs(text: string): string {
  return text.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
}

export function buildIcsContent(events: SiteEvent[], location: string, calName: string): string {
  const now = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '') + 'Z';
  const vevents = events.map((e, i) => [
    'BEGIN:VEVENT',
    `UID:claras-${e.start}-${i}@clarasdaydive.com`,
    `DTSTAMP:${now}`,
    `DTSTART:${toUtcCalendarDatetime(e.start)}`,
    `DTEND:${toUtcCalendarDatetime(e.end)}`,
    `SUMMARY:${escapeIcs(e.title)}`,
    `DESCRIPTION:${escapeIcs(e.desc)}`,
    `LOCATION:${escapeIcs(location)}`,
    'END:VEVENT',
  ].join('\r\n')).join('\r\n');

  return ['BEGIN:VCALENDAR', 'VERSION:2.0', `PRODID:-//Clara's Day Dive//EN`, `X-WR-CALNAME:${escapeIcs(calName)}`, vevents, 'END:VCALENDAR'].join('\r\n');
}
