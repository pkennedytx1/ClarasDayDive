import { useRef, useState } from 'react';
import { CalendarExplorer } from '@/components/CalendarExplorer';
import { EventListItem } from '@/components/EventListItem';
import { Reveal } from '@/components/Reveal';
import { useEventBooking } from '@/context/EventBookingContext';
import { eventKey } from '@/lib/events';
import { getEventsContent, getEventsListItems, getSiteContent } from '@/lib/content';

const PAGE_SIZE = 3;

export function Events() {
  const events = getEventsContent();
  const site = getSiteContent();
  const { openBooking } = useEventBooking();
  const location = `${site.location.address}, ${site.location.city}`;
  const [explorerOpen, setExplorerOpen] = useState(false);
  const [page, setPage] = useState(0);
  const viewAllRef = useRef<HTMLButtonElement>(null);

  const listItems = getEventsListItems(events);
  const totalPages = Math.max(1, Math.ceil(listItems.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);
  const pageItems = listItems.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);
  const hasUpcomingEvents = events.items.length > 0;
  const showPagination = listItems.length > PAGE_SIZE;
  const rangeStart = listItems.length === 0 ? 0 : safePage * PAGE_SIZE + 1;
  const rangeEnd = Math.min((safePage + 1) * PAGE_SIZE, listItems.length);

  return (
    <section id="events" className="section section--events section--compact" aria-labelledby="events-heading">
      <div className="container">
        <div className="section-rail">
        <Reveal>
          <header className="section-head section-head--brand">
            <div>
              <p className="eyebrow eyebrow--teal">{site.sections.events.eyebrow}</p>
              <h2 id="events-heading" className="display-lg">
                {site.sections.events.title}
              </h2>
            </div>
          </header>
        </Reveal>

        {events.featured ? (
          <Reveal>
            <div className="event-featured">
              <EventListItem event={events.featured} location={location} variant="featured" />
            </div>
          </Reveal>
        ) : null}

        <ol className="events-list">
          {hasUpcomingEvents ? (
            pageItems.length > 0 ? (
              pageItems.map((event, i) => (
                <li key={eventKey(event)} className="events-list__item">
                  <Reveal stagger={i} delay={60}>
                    <EventListItem event={event} location={location} />
                  </Reveal>
                </li>
              ))
            ) : (
              <li className="events-list__item">
                <Reveal>
                  <p className="events-empty">No additional upcoming events</p>
                </Reveal>
              </li>
            )
          ) : (
            <li className="events-list__item">
              <Reveal>
                <p className="events-empty">No upcoming events</p>
              </Reveal>
            </li>
          )}
        </ol>

        {showPagination ? (
          <Reveal delay={120}>
            <nav className="events-pagination" aria-label="Upcoming events pages">
              <button
                type="button"
                className="events-pagination__btn"
                disabled={safePage === 0}
                onClick={() => setPage((current) => Math.max(0, current - 1))}
              >
                Previous
              </button>
              <p className="events-pagination__status" aria-current="page">
                Showing {rangeStart}–{rangeEnd} of {listItems.length}
                <span className="events-pagination__pages">
                  {' '}
                  · Page {safePage + 1} of {totalPages}
                </span>
              </p>
              <button
                type="button"
                className="events-pagination__btn"
                disabled={safePage >= totalPages - 1}
                onClick={() => setPage((current) => Math.min(totalPages - 1, current + 1))}
              >
                Next
              </button>
            </nav>
          </Reveal>
        ) : null}

        {hasUpcomingEvents ? (
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
        ) : null}

        <Reveal delay={200}>
          <p className="events-note">
            {events.hostNote}{' '}
            <button type="button" className="here-item__link" onClick={openBooking}>
              {site.sections.events.bookingCta} →
            </button>
          </p>
        </Reveal>
        </div>

        {hasUpcomingEvents ? (
          <CalendarExplorer
            events={events.items}
            location={location}
            open={explorerOpen}
            onClose={() => setExplorerOpen(false)}
            triggerRef={viewAllRef}
          />
        ) : null}
      </div>
    </section>
  );
}
