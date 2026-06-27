import React from 'react';

export type CardTone = 'white' | 'cream' | 'rose' | 'teal' | 'ink';
export type CardPadding = 'none' | 'sm' | 'md' | 'lg';

/**
 * Rounded paper surface with a warm soft shadow — the container for menu items,
 * event blocks, and "what's here" tiles. Set `interactive` for hover-lift on click targets.
 */
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Surface color. @default "white" */
  tone?: CardTone;
  /** Inner padding. @default "md" */
  padding?: CardPadding;
  /** Hover-lift + pointer cursor for clickable cards. @default false */
  interactive?: boolean;
  children?: React.ReactNode;
}

export function Card(props: CardProps): JSX.Element;
