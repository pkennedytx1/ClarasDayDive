import { EventActions } from '@/components/EventActions';
import type { SiteEvent } from '@/lib/events';

interface EventListItemProps {
  event: SiteEvent;
  location: string;
  variant?: 'default' | 'featured';
}

export function EventListItem({ event, location, variant = 'default' }: EventListItemProps) {
  const isFeatured = variant === 'featured';

  return (
    <article className={`event-row${isFeatured ? ' event-row--featured' : ''}`}>
      <div className="event-row__head">
        <div className="event-row__date" aria-label={`${event.month} ${event.day}`}>
          <span className="event-row__month">{event.month}</span>
          <span className="event-row__day">{event.day}</span>
        </div>
        <div className="event-row__main">
          {isFeatured ? <p className="event-row__featured-label">Featured event</p> : null}
          <p className="event-row__tag">{event.tag}</p>
          <h3 className="event-row__title">{event.title}</h3>
          <p className="event-row__time">{event.timeLabel}</p>
        </div>
      </div>
      <p className="event-row__desc">{event.desc}</p>
      <EventActions event={event} location={location} variant="inline" />
    </article>
  );
}
