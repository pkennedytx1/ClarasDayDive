import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { useNavScrollHide } from '@/hooks/useNavScrollHide';
import { pathToSectionId } from '@/lib/sections';
import { scrollToSection } from '@/lib/scroll';

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
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const hidden = useNavScrollHide(open);
  const sheetRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    document.body.classList.toggle('is-nav-open', open);
    return () => document.body.classList.remove('is-nav-open');
  }, [open]);

  useEffect(() => {
    document.body.classList.toggle('is-nav-hidden', hidden);
    return () => document.body.classList.remove('is-nav-hidden');
  }, [hidden]);

  useEffect(() => {
    if (!open) return;
    const firstLink = sheetRef.current?.querySelector<HTMLElement>('a');
    firstLink?.focus();
  }, [open]);

  const close = () => {
    setOpen(false);
    toggleRef.current?.focus();
  };

  useFocusTrap(sheetRef, open, close);

  const handleNavClick = (path: string) => {
    close();
    const sectionId = pathToSectionId(path);
    if (sectionId && location.pathname === path) {
      scrollToSection(sectionId);
    }
  };

  const isActive = (href: string) => activeHref === href;

  return (
    <header className={`site-nav${hidden ? ' is-hidden' : ''}`}>
      <div className="container site-nav__inner">
        <Link
          to="/"
          className="site-nav__logo"
          aria-label="Clara's Day Dive home"
          onClick={() => handleNavClick('/')}
        >
          <img src={logoSrc} alt="Clara's Day Dive" width={280} height={72} decoding="async" />
        </Link>

        <nav className="site-nav__links" aria-label="Primary">
          {links.map((l) => (
            <Link
              key={l.label}
              to={l.href}
              className={`site-nav__link${isActive(l.href) ? ' is-active' : ''}`}
              onClick={() => handleNavClick(l.href)}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <button
          ref={toggleRef}
          type="button"
          className={`site-nav__toggle${open ? ' is-open' : ''}`}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          aria-controls="mobile-nav-sheet"
          onClick={() => setOpen((o) => !o)}
        >
          <span className="site-nav__toggle-icon" aria-hidden="true">
            <span className="site-nav__toggle-bar" />
            <span className="site-nav__toggle-bar" />
            <span className="site-nav__toggle-bar" />
          </span>
        </button>
      </div>

      <div
        ref={sheetRef}
        id="mobile-nav-sheet"
        className={`site-nav__sheet-wrap${open ? ' is-open' : ''}`}
        aria-hidden={!open}
      >
        <div className="site-nav__sheet-inner">
          <nav className="site-nav__sheet" aria-label="Mobile">
            {links.map((l) => (
              <Link
                key={l.label}
                to={l.href}
                className={`site-nav__sheet-link${isActive(l.href) ? ' is-active' : ''}`}
                onClick={() => handleNavClick(l.href)}
                tabIndex={open ? 0 : -1}
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
