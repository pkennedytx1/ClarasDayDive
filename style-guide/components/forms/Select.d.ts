import React from 'react';

export interface SelectOption {
  value: string;
  label: string;
}

/** Brand-styled native select with chevron — party size, event type, time slots. */
export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  label?: string;
  hint?: string;
  placeholder?: string;
  /** Options as plain strings or {value,label} objects. */
  options?: Array<string | SelectOption>;
}

export function Select(props: SelectProps): JSX.Element;
