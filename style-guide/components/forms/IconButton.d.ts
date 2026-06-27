import React from 'react';

export type IconButtonVariant = 'solid' | 'ink' | 'outline' | 'ghost';
export type IconButtonSize = 'sm' | 'md' | 'lg';

/**
 * Circular icon-only button — nav toggles, search submit, social links, close.
 * Always pass `label` for accessibility since there is no visible text.
 */
export interface IconButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'aria-label'> {
  /** Accessible label (required — icon-only). */
  label: string;
  /** Visual style. @default "solid" */
  variant?: IconButtonVariant;
  /** Size (36 / 44 / 52px). @default "md" */
  size?: IconButtonSize;
  disabled?: boolean;
  /** The icon node. */
  children?: React.ReactNode;
}

export function IconButton(props: IconButtonProps): JSX.Element;
