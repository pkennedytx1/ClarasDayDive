import React from 'react';

export type EyebrowColor = 'sage' | 'teal' | 'rose' | 'cream';

/**
 * Uppercase tracked overline that sits above headlines to set section context
 * ("WHAT'S POURING", "EVENTS"). Echoes the DAY DIVE label styling.
 */
export interface EyebrowProps extends React.HTMLAttributes<HTMLElement> {
  /** Color token or any CSS color. @default "sage" */
  color?: EyebrowColor | string;
  /** Element to render. @default "div" */
  as?: keyof JSX.IntrinsicElements;
  children?: React.ReactNode;
}

export function Eyebrow(props: EyebrowProps): JSX.Element;
