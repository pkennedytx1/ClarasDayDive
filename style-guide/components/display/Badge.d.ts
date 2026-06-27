import React from 'react';

export type BadgeTone = 'rose' | 'teal' | 'sage' | 'butter' | 'ink' | 'outline';

/** Small uppercase status pill for menu/event meta — "New", "Seasonal", "Sold out", "21+". */
export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Color tone. @default "rose" */
  tone?: BadgeTone;
  children?: React.ReactNode;
}

export function Badge(props: BadgeProps): JSX.Element;
