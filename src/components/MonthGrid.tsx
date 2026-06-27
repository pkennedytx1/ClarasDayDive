interface MonthGridProps {
  month: number;
  year: number;
  eventDates: Set<string>;
  eventsByDate: Record<string, unknown[]>;
  selectedDate: string;
  onSelectDate: (dateKey: string) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

function toDateKey(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function todayKey(): string {
  const d = new Date();
  return toDateKey(d.getFullYear(), d.getMonth() + 1, d.getDate());
}

function formatMonthYear(month: number, year: number): string {
  return new Date(year, month - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

function formatAriaDate(month: number, day: number): string {
  return new Date(2000, month - 1, day).toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
}

export function MonthGrid({
  month,
  year,
  eventDates,
  eventsByDate,
  selectedDate,
  onSelectDate,
  onPrevMonth,
  onNextMonth,
}: MonthGridProps) {
  const today = todayKey();
  const firstDay = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();

  const cells: Array<{ day: number; dateKey: string } | null> = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push({ day, dateKey: toDateKey(year, month, day) });
  }
  while (cells.length < 42) cells.push(null);

  return (
    <div className="month-grid">
      <div className="month-grid__nav">
        <button
          type="button"
          className="month-grid__nav-btn"
          onClick={onPrevMonth}
          aria-label="Previous month"
        >
          ‹
        </button>
        <h3 className="month-grid__title">{formatMonthYear(month, year)}</h3>
        <button
          type="button"
          className="month-grid__nav-btn"
          onClick={onNextMonth}
          aria-label="Next month"
        >
          ›
        </button>
      </div>

      <div className="month-grid__weekdays" aria-hidden="true">
        {WEEKDAYS.map((label) => (
          <span key={label} className="month-grid__weekday">
            {label}
          </span>
        ))}
      </div>

      <div className="month-grid__days" role="grid" aria-label={formatMonthYear(month, year)}>
        {cells.map((cell, i) => {
          if (!cell) {
            return <span key={`empty-${i}`} className="month-grid__day month-grid__day--empty" role="gridcell" />;
          }

          const { day, dateKey } = cell;
          const hasEvent = eventDates.has(dateKey);
          const isToday = dateKey === today;
          const isSelected = dateKey === selectedDate;
          const count = eventsByDate[dateKey]?.length ?? 0;
          const eventLabel = count === 1 ? '1 event' : `${count} events`;

          return (
            <button
              key={dateKey}
              type="button"
              role="gridcell"
              className={[
                'month-grid__day',
                hasEvent && 'month-grid__day--has-event',
                isToday && 'month-grid__day--today',
                isSelected && 'month-grid__day--selected',
              ]
                .filter(Boolean)
                .join(' ')}
              aria-label={
                hasEvent
                  ? `${formatAriaDate(month, day)}, ${eventLabel}`
                  : formatAriaDate(month, day)
              }
              aria-selected={isSelected}
              onClick={() => onSelectDate(dateKey)}
            >
              {day}
            </button>
          );
        })}
      </div>

      <p className="month-grid__legend">
        <span className="month-grid__legend-dot" aria-hidden="true" />
        = has events
      </p>
    </div>
  );
}
