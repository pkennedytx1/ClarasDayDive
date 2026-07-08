import { Link } from 'react-router-dom';
import { useRef, useState } from 'react';
import { CalendarExplorer } from '@/components/CalendarExplorer';
import { EventActions } from '@/components/EventActions';
import { Reveal } from '@/components/Reveal';
import { getEventsContent, getSiteContent } from '@/lib/content';

export function Events() {
  const events = getEventsContent();
  const site = getSiteContent();
  const location = `${site.location.address}, ${site.location.city}`;
  const [explorerOpen, setExplorerOpen] = useState(false);
  const viewAllRef = useRef<HTMLButtonElement>(null);

  return (
    <section id="events" className="section section--events section--compact" aria-labelledby="events-heading">
      <div className="container">
        <div className="section-rail">
        <Reveal>
          <header className="section-head section-head--brand">
            <div>
              <p className="eyebrow eyebrow--teal">On the calendar</p>
              <h2 id="events-heading" className="display-lg">
                Upcoming events
              </h2>
            </div>
          </header>
        </Reveal>

        <ol className="events-list">
          {events.items.map((e, i) => (
            <li key={e.day + e.title} className="events-list__item">
              <Reveal stagger={i} delay={60}>
                <article className="event-row">
                  <div className="event-row__head">
                    <div className="event-row__date" aria-label={`${e.month} ${e.day}`}>
                      <span className="event-row__month">{e.month}</span>
                      <span className="event-row__day">{e.day}</span>
                    </div>
                    <div className="event-row__main">
                      <p className="event-row__tag">{e.tag}</p>
                      <h3 className="event-row__title">{e.title}</h3>
                      <p className="event-row__time">{e.timeLabel}</p>
                    </div>
                  </div>
                  <p className="event-row__desc">{e.desc}</p>
                  <EventActions event={e} location={location} variant="inline" />
                </article>
              </Reveal>
            </li>
          ))}
        </ol>

        <Reveal delay={160}>
          <div className="events-footer">
            <button
              ref={viewAllRef}
              type="button"
              className="here-item__link"
              aria-expanded={explorerOpen}
              aria-controls="calendar-explorer"
              onClick={() => setExplorerOpen(true)}
            >
              View all events →
            </button>
          </div>
        </Reveal>

        <Reveal delay={200}>
          <p className="events-note">
            {events.hostNote}{' '}
            <Link to="/contact">Book the bar →</Link>
          </p>
        </Reveal>
        </div>

        <CalendarExplorer
          events={events.items}
          location={location}
          open={explorerOpen}
          onClose={() => setExplorerOpen(false)}
          triggerRef={viewAllRef}
        />
      </div>
    </section>
  );
}
