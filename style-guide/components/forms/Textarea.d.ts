import React from 'react';

/** Multi-line text field — message bodies on the event-coordinator contact form. */
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
  /** Visible rows. @default 4 */
  rows?: number;
}

export function Textarea(props: TextareaProps): JSX.Element;
