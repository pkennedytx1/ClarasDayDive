import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const events = JSON.parse(readFileSync(join(root, 'src/content/events.json'), 'utf8'));
const site = JSON.parse(readFileSync(join(root, 'src/content/site.json'), 'utf8'));

function escapeIcs(text) {
  return text.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
}

function buildIcsContent(items, location, calName) {
  const now = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '') + 'Z';
  const vevents = items
    .map(
      (e, i) =>
        [
          'BEGIN:VEVENT',
          `UID:claras-${e.start}-${i}@clarasdaydive.com`,
          `DTSTAMP:${now}`,
          `DTSTART:${e.start.replace(/[-:]/g, '').replace('.000', '')}`,
          `DTEND:${e.end.replace(/[-:]/g, '').replace('.000', '')}`,
          `SUMMARY:${escapeIcs(e.title)}`,
          `DESCRIPTION:${escapeIcs(e.desc)}`,
          `LOCATION:${escapeIcs(location)}`,
          'END:VEVENT',
        ].join('\r\n'),
    )
    .join('\r\n');

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    `PRODID:-//Clara's Day Dive//EN`,
    `X-WR-CALNAME:${escapeIcs(calName)}`,
    vevents,
    'END:VCALENDAR',
  ].join('\r\n');
}

const location = `${site.location.address}, ${site.location.city}`;
const calName = `${site.name} events`;
const ics = buildIcsContent(events.items, location, calName);

const outDir = join(root, 'public/calendar');
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, 'claras-day-dive.ics'), ics);
console.log(`Generated public/calendar/claras-day-dive.ics (${events.items.length} events)`);
