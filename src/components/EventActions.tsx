import type { SiteEvent } from '@/lib/events';
import { buildGoogleCalendarUrl } from '@/lib/events';
import { buildIcsContent } from '@/lib/ics';

interface EventActionsProps {
  event: SiteEvent;
  location: string;
}

function downloadIcs(event: SiteEvent, location: string) {
  const content = buildIcsContent([event], location, event.title);
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `${event.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.ics`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function EventActions({ event, location }: EventActionsProps) {
  const googleUrl = buildGoogleCalendarUrl(event, location);

  return (
    <div className="event-actions">
      <div className="event-actions__calendar">
        <span className="event-actions__label">Add to calendar</span>
        <div className="event-actions__links">
          <button
            type="button"
            className="event-actions__btn btn btn--secondary"
            onClick={() => downloadIcs(event, location)}
          >
            Download .ics
          </button>
          <a
            href={googleUrl}
            className="event-actions__btn btn btn--secondary"
            target="_blank"
            rel="noopener noreferrer"
          >
            Google Calendar
          </a>
        </div>
      </div>
      {event.ticketUrl && (
        <a
          href={event.ticketUrl}
          className="event-actions__btn event-actions__btn--ticket btn btn--primary"
          target="_blank"
          rel="noopener noreferrer"
        >
          Get tickets / RSVP →
        </a>
      )}
    </div>
  );
}
