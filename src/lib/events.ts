export interface SiteEvent {
  start: string;
  end: string;
  month: string;
  day: string;
  tag: string;
  title: string;
  timeLabel: string;
  desc: string;
  ticketUrl?: string;
}

export function toDateKey(iso: string): string {
  return iso.slice(0, 10);
}

export function groupEventsByDate(events: SiteEvent[]): Record<string, SiteEvent[]> {
  return events.reduce<Record<string, SiteEvent[]>>((acc, event) => {
    const key = toDateKey(event.start);
    (acc[key] ??= []).push(event);
    return acc;
  }, {});
}

export function formatDayHeading(isoDate: string): string {
  const d = new Date(isoDate + 'T12:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

export function buildGoogleCalendarUrl(event: SiteEvent, location: string): string {
  const fmt = (iso: string) => iso.replace(/[-:]/g, '').replace('.000', '').slice(0, 15) + 'Z';
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${fmt(event.start)}/${fmt(event.end)}`,
    details: event.desc,
    location,
  });
  return `https://calendar.google.com/calendar/render?${params}`;
}
