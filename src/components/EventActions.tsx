import type { SiteEvent } from '@/lib/events';
import { buildGoogleCalendarUrl } from '@/lib/events';
import { buildIcsContent } from '@/lib/ics';

interface EventActionsProps {
  event: SiteEvent;
  location: string;
  variant?: 'stacked' | 'inline';
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

function TicketLink({ event }: { event: SiteEvent }) {
  if (!event.ticketUrl) return null;

  return (
    <a
      href={event.ticketUrl}
      className="here-item__link here-item__link--order"
      target="_blank"
      rel="noopener noreferrer"
    >
      Get tickets / RSVP →
      <span className="visually-hidden">
        {' '}
        for {event.title} (opens in a new tab)
      </span>
    </a>
  );
}

function CalendarButtons({
  event,
  googleUrl,
  onDownload,
}: {
  event: SiteEvent;
  googleUrl: string;
  onDownload: () => void;
}) {
  const groupId = `event-calendar-${event.start.replace(/[^a-z0-9]/gi, '-')}-${event.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;

  return (
    <div className="event-actions__calendar" role="group" aria-labelledby={groupId}>
      <p id={groupId} className="event-actions__hint">
        Add to your calendar
      </p>
      <div className="here-item__links">
        <button
          type="button"
          className="here-item__link"
          onClick={onDownload}
        >
          Download calendar event
        </button>
        <a
          href={googleUrl}
          className="here-item__link"
          target="_blank"
          rel="noopener noreferrer"
        >
          Add to Google Calendar
          <span className="visually-hidden">
            {' '}
            for {event.title} (opens in a new tab)
          </span>
        </a>
      </div>
    </div>
  );
}

export function EventActions({ event, location, variant = 'stacked' }: EventActionsProps) {
  const googleUrl = buildGoogleCalendarUrl(event, location);
  const handleDownload = () => downloadIcs(event, location);

  return (
    <div className={`event-actions${variant === 'inline' ? ' event-actions--inline' : ''}`}>
      <TicketLink event={event} />
      <CalendarButtons event={event} googleUrl={googleUrl} onDownload={handleDownload} />
    </div>
  );
}
