import React from 'react';

export interface NavLink {
  label: string;
  href: string;
}

/**
 * Sticky single-page site navigation. Transparent over the hero; turns to a translucent
 * cream blur once `scrolled` is true. Wordmark left, links + rose CTA right, hamburger sheet
 * on mobile.
 *
 * @startingPoint section="Navigation" subtitle="Sticky site nav with AI-search CTA" viewport="1180x90"
 */
export interface NavBarProps extends React.HTMLAttributes<HTMLElement> {
  /** Wordmark/logo image src. Falls back to a text wordmark. */
  logoSrc?: string;
  /** Nav links. */
  links?: NavLink[];
  /** CTA button label. @default "Reserve" */
  ctaLabel?: string;
  /** CTA click handler. */
  onCta?: () => void;
  /** Whether the page has scrolled (drives the translucent treatment). @default false */
  scrolled?: boolean;
}

export function NavBar(props: NavBarProps): JSX.Element;
