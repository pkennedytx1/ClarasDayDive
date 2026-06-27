import React from 'react';

/**
 * One line on the drinks/food menu — italic Playfair name, dotted leader, rose price,
 * optional description and teal badges (Seasonal, Zero-proof…).
 */
export interface MenuRowProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Drink/item name. */
  name: string;
  /** Price, pre-formatted (e.g. "$12"). */
  price: string;
  /** Optional one-line description. */
  description?: string;
  /** Optional badge labels. */
  badges?: string[];
}

export function MenuRow(props: MenuRowProps): JSX.Element;
