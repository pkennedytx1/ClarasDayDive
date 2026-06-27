import { Link } from 'react-router-dom';

interface LegalHeaderProps {
  scrolled?: boolean;
}

export function LegalHeader({ scrolled = false }: LegalHeaderProps) {
  return (
    <header className={`legal-header${scrolled ? ' is-scrolled' : ''}`}>
      <div className="container legal-header__inner">
        <Link to="/" className="legal-header__logo" aria-label="Clara's Day Dive home">
          <img src="/assets/wordmark-color.png" alt="" width={140} height={36} decoding="async" />
        </Link>
        <Link to="/" className="legal-header__back">
          ← Back to site
        </Link>
      </div>
    </header>
  );
}
