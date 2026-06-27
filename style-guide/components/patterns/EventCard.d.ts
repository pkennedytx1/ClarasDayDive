import React from 'react';

/**
 * A single events-calendar entry — rose date chip, italic title, time/host meta, optional
 * RSVP button. Hover-lifts like a Card.
 */
export interface EventCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Short month, e.g. "JUL". */
  month: string;
  /** Day number, e.g. "18". */
  day: string;
  /** Event title. */
  title: string;
  /** Time / host / location meta line. */
  meta?: string;
  /** Optional eyebrow tag (e.g. "Live music"). */
  tag?: string;
  /** RSVP handler — renders the RSVP button when provided. */
  onRsvp?: () => void;
}

export function EventCard(props: EventCardProps): JSX.Element;
