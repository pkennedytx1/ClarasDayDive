import { Link } from 'react-router-dom';
import { getLegalContent } from '@/lib/content';

interface LegalLinksProps {
  className?: string;
  inline?: boolean;
}

export function LegalLinks({ className = '', inline = false }: LegalLinksProps) {
  const { policies } = getLegalContent();

  return (
    <nav className={`legal-links${inline ? ' legal-links--inline' : ''}${className ? ` ${className}` : ''}`} aria-label="Legal policies">
      {policies.map((policy) => (
        <Link key={policy.slug} to={policy.path} className="legal-links__item">
          {policy.title}
        </Link>
      ))}
    </nav>
  );
}
