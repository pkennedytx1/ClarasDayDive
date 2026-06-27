import { EventActions } from '@/components/EventActions';
import { formatDayHeading, type SiteEvent } from '@/lib/events';

interface DayDetailProps {
  date: string;
  events: SiteEvent[];
  location: string;
}

export function DayDetail({ date, events, location }: DayDetailProps) {
  return (
    <div className="day-detail">
      <h3 className="day-detail__heading">{formatDayHeading(date)}</h3>

      {events.length === 0 ? (
        <p className="day-detail__empty">
          Nothing on the calendar this day — check back soon or book the patio.
        </p>
      ) : (
        <ul className="day-detail__list">
          {events.map((event) => (
            <li key={event.start + event.title}>
              <article className="day-detail__card">
                <p className="event-row__tag">{event.tag}</p>
                <h4 className="event-row__title">{event.title}</h4>
                <p className="event-row__time">{event.timeLabel}</p>
                <p className="event-row__desc">{event.desc}</p>
                <EventActions event={event} location={location} />
              </article>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
