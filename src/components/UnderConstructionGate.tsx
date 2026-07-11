import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { Button } from '@/components/Button';
import { getSiteContent } from '@/lib/content';

const UNLOCK_KEY = 'cdd-site-unlock';

function readUnlockState(password: string): boolean {
  try {
    return sessionStorage.getItem(UNLOCK_KEY) === password;
  } catch {
    return false;
  }
}

interface UnderConstructionGateProps {
  children: ReactNode;
}

export function UnderConstructionGate({ children }: UnderConstructionGateProps) {
  const { underConstruction, underConstructionPassword } = getSiteContent();
  const gatePassword = underConstructionPassword || '102712';
  const [unlocked, setUnlocked] = useState(() => readUnlockState(gatePassword));
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!underConstruction) return;
    document.body.style.overflow = unlocked ? '' : 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [underConstruction, unlocked]);

  if (!underConstruction) return <>{children}</>;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (password === gatePassword) {
      try {
        sessionStorage.setItem(UNLOCK_KEY, gatePassword);
      } catch {
        /* sessionStorage unavailable */
      }
      setUnlocked(true);
      setError(false);
      return;
    }

    setError(true);
  };

  if (unlocked) return <>{children}</>;

  return (
    <div className="site-gate" role="dialog" aria-modal="true" aria-labelledby="site-gate-title">
      <div className="site-gate__panel">
        <p className="eyebrow site-gate__eyebrow">Clara&apos;s Day Dive</p>
        <h1 id="site-gate-title" className="site-gate__title">
          Under construction
        </h1>
        <p className="site-gate__copy">We&apos;re making updates. Enter the password to continue.</p>
        <form className="site-gate__form" onSubmit={handleSubmit}>
          <label htmlFor="site-gate-password" className="visually-hidden">
            Password
          </label>
          <input
            id="site-gate-password"
            type="password"
            inputMode="numeric"
            autoComplete="current-password"
            className={`site-gate__input${error ? ' site-gate__input--error' : ''}`}
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
              setError(false);
            }}
            placeholder="Password"
          />
          {error ? (
            <p className="site-gate__error" role="alert">
              Incorrect password
            </p>
          ) : null}
          <Button type="submit" full>
            Enter
          </Button>
        </form>
      </div>
    </div>
  );
}
