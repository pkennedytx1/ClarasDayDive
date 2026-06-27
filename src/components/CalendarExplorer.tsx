import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import { DayDetail } from '@/components/DayDetail';
import { MonthGrid } from '@/components/MonthGrid';
import { groupEventsByDate, toDateKey, type SiteEvent } from '@/lib/events';

interface CalendarExplorerProps {
  events: SiteEvent[];
  location: string;
  open: boolean;
  onClose: () => void;
  triggerRef?: RefObject<HTMLButtonElement | null>;
}

function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getInitialSelectedDate(events: SiteEvent[]): string {
  const today = todayKey();
  const sorted = [...events].map((e) => toDateKey(e.start)).sort();
  const upcoming = sorted.find((d) => d >= today);
  return upcoming ?? today;
}

function parseDateKey(dateKey: string): { year: number; month: number } {
  const [year, month] = dateKey.split('-').map(Number);
  return { year, month };
}

export function CalendarExplorer({
  events,
  location,
  open,
  onClose,
  triggerRef,
}: CalendarExplorerProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const liveRef = useRef<HTMLDivElement>(null);
  const eventsByDate = groupEventsByDate(events);
  const eventDates = new Set(Object.keys(eventsByDate));

  const [selectedDate, setSelectedDate] = useState(() => getInitialSelectedDate(events));
  const [viewMonth, setViewMonth] = useState(() => parseDateKey(getInitialSelectedDate(events)).month);
  const [viewYear, setViewYear] = useState(() => parseDateKey(getInitialSelectedDate(events)).year);

  const resetOnOpen = useCallback(() => {
    const initial = getInitialSelectedDate(events);
    const { year, month } = parseDateKey(initial);
    setSelectedDate(initial);
    setViewMonth(month);
    setViewYear(year);
  }, [events]);

  useEffect(() => {
    if (open) resetOnOpen();
  }, [open, resetOnOpen]);

  useEffect(() => {
    if (!open) return;

    const dialog = dialogRef.current;
    const focusable = dialog?.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    const first = focusable?.[0];
    const last = focusable?.[focusable.length - 1];

    first?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== 'Tab' || !focusable?.length) return;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
      (triggerRef?.current ?? document.activeElement as HTMLElement)?.focus();
    };
  }, [open, onClose, triggerRef]);

  useEffect(() => {
    if (!open || !liveRef.current) return;
    const count = eventsByDate[selectedDate]?.length ?? 0;
    const label =
      count === 0
        ? 'No events on this day'
        : count === 1
          ? '1 event on this day'
          : `${count} events on this day`;
    liveRef.current.textContent = label;
  }, [open, selectedDate, eventsByDate]);

  const onPrevMonth = () => {
    if (viewMonth === 1) {
      setViewMonth(12);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const onNextMonth = () => {
    if (viewMonth === 12) {
      setViewMonth(1);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  if (!open) return null;

  const dayEvents = eventsByDate[selectedDate] ?? [];

  return (
    <div className="calendar-explorer" onClick={onClose}>
      <div
        ref={dialogRef}
        id="calendar-explorer"
        className="calendar-explorer__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="calendar-explorer-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="calendar-explorer__header">
          <h2 id="calendar-explorer-title" className="calendar-explorer__title">
            Upcoming events
          </h2>
          <button
            type="button"
            className="calendar-explorer__close"
            onClick={onClose}
            aria-label="Close calendar"
          >
            ×
          </button>
        </header>

        <div ref={liveRef} className="visually-hidden" aria-live="polite" />

        <div className="calendar-explorer__body">
          <MonthGrid
            month={viewMonth}
            year={viewYear}
            eventDates={eventDates}
            eventsByDate={eventsByDate}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            onPrevMonth={onPrevMonth}
            onNextMonth={onNextMonth}
          />
          <DayDetail date={selectedDate} events={dayEvents} location={location} />
        </div>
      </div>
    </div>
  );
}
