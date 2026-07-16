import { useEffect, useId, useState } from 'react';
import { getWhatsHereHoursLines, getWhatsHereHoursStatus } from '@/lib/whats-here-hours';

interface WhatsHereHoursPillProps {
  hours: string;
  vendorName: string;
}

export function WhatsHereHoursPill({ hours, vendorName }: WhatsHereHoursPillProps) {
  const listId = useId();
  const [expanded, setExpanded] = useState(false);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const status = getWhatsHereHoursStatus(hours, now);
  const lines = getWhatsHereHoursLines(hours);

  const statusLabel = status.isOpen
    ? `${vendorName} is open, ${status.label}`
    : status.label.includes('Opens at')
      ? `${vendorName} is closed and ${status.label.replace('Closed · ', '').toLowerCase()}`
      : `${vendorName} is closed today`;

  return (
    <div className="here-item__hours-block">
      <div className="here-item__status-row">
        <p
          className={`here-item__status here-item__status--${status.isOpen ? 'open' : 'closed'}`}
          aria-label={statusLabel}
        >
          {status.isOpen ? <span className="here-item__status-dot" aria-hidden="true" /> : null}
          <span aria-hidden="true">{status.label}</span>
        </p>
        <button
          type="button"
          className="here-item__hours-toggle"
          aria-expanded={expanded}
          aria-controls={listId}
          onClick={() => setExpanded((open) => !open)}
        >
          <span className="here-item__hours-toggle-label">{expanded ? 'Hide hours' : 'All hours'}</span>
          <span className={`here-item__hours-chevron${expanded ? ' is-open' : ''}`} aria-hidden="true" />
        </button>
      </div>
      <div className={`here-item__hours-panel${expanded ? ' is-open' : ''}`}>
        <div className="here-item__hours-panel-inner">
          <ul id={listId} className="here-item__hours-list" aria-hidden={!expanded}>
            {lines.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
