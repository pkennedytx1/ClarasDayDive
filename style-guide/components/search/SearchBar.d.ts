import React from 'react';

/**
 * The hero AI search — Clara's signature "ask me what to drink" pill. Large by default,
 * with an optional row of suggestion chips beneath. This is meant to be prominent,
 * never buried.
 *
 * @startingPoint section="Search" subtitle="Hero AI search pill with suggestion chips" viewport="700x200"
 */
export interface SearchBarProps extends Omit<React.HTMLAttributes<HTMLFormElement>, 'onSubmit'> {
  /** Placeholder text. @default "Ask Clara what to drink…" */
  placeholder?: string;
  /** Submit button label. @default "Dive in" */
  buttonLabel?: string;
  /** Quick suggestion chips rendered below the bar. */
  suggestions?: string[];
  /** Size. @default "lg" */
  size?: 'md' | 'lg';
  /** Called with the query string on submit or chip click. */
  onSubmit?: (query: string) => void;
}

export function SearchBar(props: SearchBarProps): JSX.Element;
