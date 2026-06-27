import React from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'callout' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

/**
 * Pill-shaped brand button — the primary call to action across Clara's surfaces.
 * Use `primary` (rose) for the main action, `secondary` (ink outline) for alternates,
 * `callout` (teal) for events/highlights, `ghost` for tertiary inline actions.
 *
 * @startingPoint section="Forms" subtitle="Pill button — rose / ink / teal / ghost" viewport="700x160"
 */
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual style. @default "primary" */
  variant?: ButtonVariant;
  /** Size. @default "md" */
  size?: ButtonSize;
  /** Stretch to fill container width. @default false */
  full?: boolean;
  /** Disable interaction. @default false */
  disabled?: boolean;
  /** Optional element rendered before the label. */
  iconLeft?: React.ReactNode;
  /** Optional element rendered after the label. */
  iconRight?: React.ReactNode;
  children?: React.ReactNode;
}

export function Button(props: ButtonProps): JSX.Element;
