import type { SiteEvent } from './events';

function escapeIcs(text: string): string {
  return text.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
}

export function buildIcsContent(events: SiteEvent[], location: string, calName: string): string {
  const now = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '') + 'Z';
  const vevents = events.map((e, i) => [
    'BEGIN:VEVENT',
    `UID:claras-${e.start}-${i}@clarasdaydive.com`,
    `DTSTAMP:${now}`,
    `DTSTART:${e.start.replace(/[-:]/g, '').replace('.000', '')}`,
    `DTEND:${e.end.replace(/[-:]/g, '').replace('.000', '')}`,
    `SUMMARY:${escapeIcs(e.title)}`,
    `DESCRIPTION:${escapeIcs(e.desc)}`,
    `LOCATION:${escapeIcs(location)}`,
    'END:VEVENT',
  ].join('\r\n')).join('\r\n');

  return ['BEGIN:VCALENDAR', 'VERSION:2.0', `PRODID:-//Clara's Day Dive//EN`, `X-WR-CALNAME:${escapeIcs(calName)}`, vevents, 'END:VCALENDAR'].join('\r\n');
}
