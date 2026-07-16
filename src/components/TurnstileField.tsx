import { useEffect, useId, useRef } from 'react';

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          'error-callback'?: () => void;
          'expired-callback'?: () => void;
          theme?: 'light' | 'dark' | 'auto';
        },
      ) => string;
      remove: (widgetId: string) => void;
      reset: (widgetId: string) => void;
    };
  }
}

const SCRIPT_ID = 'cf-turnstile-script';
const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

interface TurnstileFieldProps {
  onToken: (token: string) => void;
  onExpire: () => void;
  onError: () => void;
}

function loadTurnstileScript(): Promise<void> {
  if (window.turnstile) return Promise.resolve();
  const existing = document.getElementById(SCRIPT_ID);
  if (existing) {
    return new Promise((resolve, reject) => {
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => reject(new Error('Turnstile failed to load')), { once: true });
    });
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.id = SCRIPT_ID;
    script.src = SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Turnstile failed to load'));
    document.head.appendChild(script);
  });
}

export function getTurnstileSiteKey(): string | undefined {
  const key = import.meta.env.VITE_TURNSTILE_SITE_KEY?.trim();
  return key || undefined;
}

export function TurnstileField({ onToken, onExpire, onError }: TurnstileFieldProps) {
  const siteKey = getTurnstileSiteKey();
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const hintId = useId();

  useEffect(() => {
    if (!siteKey || !containerRef.current) return;

    let cancelled = false;

    loadTurnstileScript()
      .then(() => {
        if (cancelled || !containerRef.current || !window.turnstile) return;
        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          theme: 'light',
          callback: onToken,
          'expired-callback': onExpire,
          'error-callback': onError,
        });
      })
      .catch(() => onError());

    return () => {
      cancelled = true;
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [siteKey, onToken, onExpire, onError]);

  if (!siteKey) return null;

  return (
    <div className="booking-turnstile">
      <p id={hintId} className="booking-turnstile__label">
        Quick check — confirm you&apos;re human
      </p>
      <div ref={containerRef} aria-describedby={hintId} />
    </div>
  );
}
