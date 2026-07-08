import { Link } from 'react-router-dom';

export function LegalHeader() {
  return (
    <header className="legal-header">
      <div className="container legal-header__inner">
        <Link to="/" className="legal-header__logo" aria-label="Clara's Day Dive home">
          <img
            src="/assets/wordmark-color.png"
            alt="Clara's Day Dive"
            width={280}
            height={72}
            decoding="async"
          />
        </Link>
        <Link to="/" className="legal-header__back">
          ← Back to site
        </Link>
      </div>
    </header>
  );
}
