import React from 'react';

/**
 * Text field on paper-white with a teal focus ring. Use `pill` for hero/search-style
 * inputs, the default rounded shape for forms (contact, event coordinator).
 */
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Field label rendered above the control. */
  label?: string;
  /** Helper text below the field. */
  hint?: string;
  /** Error message — turns the border rose and overrides hint. */
  error?: string;
  /** Fully rounded pill shape. @default false */
  pill?: boolean;
  /** Optional leading icon node. */
  iconLeft?: React.ReactNode;
}

export function Input(props: InputProps): JSX.Element;
