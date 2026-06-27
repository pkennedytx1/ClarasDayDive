import React from 'react';

/**
 * Toggleable filter chip for drink families and food-truck categories.
 * Active = filled ink; idle = hairline outline.
 */
export interface TagProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Selected state. @default false */
  active?: boolean;
  children?: React.ReactNode;
}

export function Tag(props: TagProps): JSX.Element;
