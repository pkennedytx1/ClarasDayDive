import type { MouseEvent } from 'react';
import { useEffect, useState } from 'react';
import { useNavScrollHide } from '@/hooks/useNavScrollHide';
import { handleAnchorClick } from '@/lib/scroll';

interface NavLink {
  label: string;
  href: string;
}

interface NavBarProps {
  logoSrc: string;
  links: NavLink[];
  activeHref: string;
}

export function NavBar({ logoSrc, links, activeHref }: NavBarProps) {
  const [open, setOpen] = useState(false);
  const hidden = useNavScrollHide(open);

  useEffect(() => {
    document.body.classList.toggle('is-nav-open', open);
    return () => document.body.classList.remove('is-nav-open');
  }, [open]);

  useEffect(() => {
    document.body.classList.toggle('is-nav-hidden', hidden);
    return () => document.body.classList.remove('is-nav-hidden');
  }, [hidden]);

  const navigate = (event: MouseEvent<HTMLAnchorElement>, href: string) => {
    handleAnchorClick(event, href, () => setOpen(false));
  };

  const isActive = (href: string) => activeHref === href;

  return (
    <header className={`site-nav${hidden ? ' is-hidden' : ''}`}>
      <div className="container site-nav__inner">
        <a
          href="#top"
          className="site-nav__logo"
          aria-label="Clara's Day Dive home"
          onClick={(e) => navigate(e, '#top')}
        >
          <img src={logoSrc} alt="Clara's Day Dive" width={280} height={72} decoding="async" />
        </a>

        <nav className="site-nav__links" aria-label="Primary">
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className={`site-nav__link${isActive(l.href) ? ' is-active' : ''}`}
              onClick={(e) => navigate(e, l.href)}
            >
              {l.label}
            </a>
          ))}
        </nav>

        <button
          type="button"
          className={`site-nav__toggle${open ? ' is-open' : ''}`}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          <span className="site-nav__toggle-icon" aria-hidden="true">
            <span className="site-nav__toggle-bar" />
            <span className="site-nav__toggle-bar" />
            <span className="site-nav__toggle-bar" />
          </span>
        </button>
      </div>

      <div className={`site-nav__sheet-wrap${open ? ' is-open' : ''}`} aria-hidden={!open}>
        <div className="site-nav__sheet-inner">
          <nav className="site-nav__sheet" aria-label="Mobile">
            {links.map((l) => (
              <a
                key={l.label}
                href={l.href}
                className={`site-nav__sheet-link${isActive(l.href) ? ' is-active' : ''}`}
                onClick={(e) => navigate(e, l.href)}
                tabIndex={open ? 0 : -1}
              >
                {l.label}
              </a>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
