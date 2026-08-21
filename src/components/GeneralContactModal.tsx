import { useCallback, useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { Button } from '@/components/Button';
import { BookingRevealItem, BookingStepReveal } from '@/components/BookingStepReveal';
import { TurnstileField, getTurnstileSiteKey, type TurnstileFieldHandle } from '@/components/TurnstileField';
import { getSiteContent } from '@/lib/content';
import { EMPTY_GENERAL_CONTACT, submitGeneralContact } from '@/lib/general-contact-api';
import {
  hasGeneralContactErrors,
  validateGeneralContact,
  type GeneralContactFieldErrors,
  type GeneralContactFieldName,
  type GeneralContactForm,
} from '@/lib/general-contact-validation';

interface GeneralContactModalProps {
  open: boolean;
  onClose: () => void;
}

function ContactField({
  label,
  name,
  error,
  children,
}: {
  label: string;
  name: GeneralContactFieldName;
  error?: string;
  children: ReactNode;
}) {
  const errorId = `${name}-error`;
  return (
    <label className={`booking-field${error ? ' booking-field--error' : ''}`}>
      <span className="booking-field__label">{label}</span>
      {children}
      {error ? (
        <span id={errorId} className="booking-field__error" role="alert">
          {error}
        </span>
      ) : null}
    </label>
  );
}

function fieldInputProps(name: GeneralContactFieldName, error?: string) {
  const errorId = `${name}-error`;
  return {
    name,
    'aria-invalid': error ? true : undefined,
    'aria-describedby': error ? errorId : undefined,
  } as const;
}

const CLOSE_ANIM_MS = 280;
const SUCCESS_AUTO_CLOSE_MS = 4000;
const VERIFY_FAIL_CLOSE_MS = 2500;

type ContactPhase = 'form' | 'verify' | 'sending' | 'success';

function getModalTitle(phase: ContactPhase, fallback: string): string {
  switch (phase) {
    case 'verify':
      return "Verifying you're human";
    case 'sending':
      return 'Sending your message';
    case 'success':
      return 'Message sent';
    default:
      return fallback;
  }
}

function getCloseDuration(): number {
  if (typeof window === 'undefined') return CLOSE_ANIM_MS;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : CLOSE_ANIM_MS;
}

export function GeneralContactModal({ open, onClose }: GeneralContactModalProps) {
  const site = getSiteContent();
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const openedAtRef = useRef(0);
  const dragRef = useRef({ active: false, startY: 0, offset: 0 });
  const turnstileRef = useRef<TurnstileFieldHandle>(null);
  const failCloseTimerRef = useRef<number | null>(null);
  const turnstileRequired = Boolean(getTurnstileSiteKey());

  const [phase, setPhase] = useState<ContactPhase>('form');
  const [form, setForm] = useState<GeneralContactForm>(EMPTY_GENERAL_CONTACT);
  const [fieldErrors, setFieldErrors] = useState<GeneralContactFieldErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [turnstileError, setTurnstileError] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState(0);
  const [honeypot, setHoneypot] = useState('');
  const [turnstileKey, setTurnstileKey] = useState(0);
  const [isPresent, setIsPresent] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const requestClose = useCallback(() => {
    if (isClosing || !isPresent) return;
    setIsClosing(true);
    onClose();
  }, [isClosing, isPresent, onClose]);

  useEffect(() => {
    if (open) {
      setIsPresent(true);
      setIsClosing(false);
      setDragOffset(0);
    } else if (isPresent && !isClosing) {
      setIsClosing(true);
    }
  }, [open, isPresent, isClosing]);

  useEffect(() => {
    if (!isClosing) return;
    const timer = window.setTimeout(() => {
      setIsPresent(false);
      setIsClosing(false);
      setDragOffset(0);
    }, getCloseDuration());
    return () => window.clearTimeout(timer);
  }, [isClosing]);

  const reset = useCallback(() => {
    if (failCloseTimerRef.current) {
      window.clearTimeout(failCloseTimerRef.current);
      failCloseTimerRef.current = null;
    }
    setPhase('form');
    setForm(EMPTY_GENERAL_CONTACT);
    setFieldErrors({});
    setSubmitError(null);
    setTurnstileError(null);
    setDragOffset(0);
    setHoneypot('');
    setTurnstileKey((current) => current + 1);
    openedAtRef.current = Date.now();
  }, []);

  useEffect(() => {
    if (!open) return;
    reset();
  }, [open, reset]);

  useEffect(() => {
    if (!isPresent) return;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isPresent]);

  useEffect(() => {
    if (!isPresent || isClosing) return;

    const dialog = dialogRef.current;
    const focusable = dialog?.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    const first = focusable?.[0];
    const last = focusable?.[focusable.length - 1];

    first?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        requestClose();
        return;
      }
      if (e.key !== 'Tab' || !focusable?.length) return;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isPresent, isClosing, requestClose, phase]);

  useEffect(() => {
    if (phase !== 'success') return;
    const timer = window.setTimeout(() => requestClose(), SUCCESS_AUTO_CLOSE_MS);
    return () => window.clearTimeout(timer);
  }, [phase, requestClose]);

  useEffect(() => {
    if (phase !== 'verify' || !turnstileRequired) return;
    const timer = window.setTimeout(() => {
      if (!turnstileRef.current?.execute()) {
        setTurnstileError('Human verification failed to load. Closing…');
        failCloseTimerRef.current = window.setTimeout(() => requestClose(), VERIFY_FAIL_CLOSE_MS);
      }
    }, 150);
    return () => window.clearTimeout(timer);
  }, [phase, turnstileRequired, turnstileKey, requestClose]);

  const failVerificationAndClose = useCallback(
    (message: string) => {
      setTurnstileError(message);
      setPhase('verify');
      if (failCloseTimerRef.current) window.clearTimeout(failCloseTimerRef.current);
      failCloseTimerRef.current = window.setTimeout(() => requestClose(), VERIFY_FAIL_CLOSE_MS);
    },
    [requestClose],
  );

  const updateField = (field: GeneralContactFieldName, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
    setSubmitError(null);
  };

  const sendMessage = useCallback(
    async (token: string) => {
      setPhase('sending');
      setSubmitError(null);
      setTurnstileError(null);
      const result = await submitGeneralContact(form, {
        turnstileToken: token || undefined,
        openedAt: openedAtRef.current,
        website: honeypot,
      });

      if (!result.ok) {
        setSubmitError(result.error);
        setTurnstileKey((current) => current + 1);
        setPhase('form');
        return;
      }

      setPhase('success');
    },
    [form, honeypot],
  );

  const onTurnstileToken = useCallback(
    (token: string) => {
      setTurnstileError(null);
      setSubmitError(null);
      void sendMessage(token);
    },
    [sendMessage],
  );

  const onTurnstileExpire = useCallback(() => {
    failVerificationAndClose('Verification expired. Closing…');
  }, [failVerificationAndClose]);

  const onTurnstileError = useCallback(() => {
    failVerificationAndClose('Human verification failed. Closing…');
  }, [failVerificationAndClose]);

  const beginSubmit = () => {
    if (turnstileRequired) {
      setTurnstileError(null);
      setSubmitError(null);
      setTurnstileKey((current) => current + 1);
      setPhase('verify');
      return;
    }
    void sendMessage('');
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (phase !== 'form') return;

    const errors = validateGeneralContact(form);
    if (hasGeneralContactErrors(errors)) {
      setFieldErrors(errors);
      setSubmitError(null);
      setTurnstileError(null);
      const firstKey = Object.keys(errors)[0] as GeneralContactFieldName | undefined;
      if (firstKey && bodyRef.current) {
        bodyRef.current.querySelector<HTMLElement>(`[name="${firstKey}"]`)?.focus();
      }
      return;
    }

    beginSubmit();
  };

  const isBusy = phase === 'verify' || phase === 'sending';

  const canStartSheetDrag = (target: EventTarget | null) => {
    if (isBusy || !window.matchMedia('(max-width: 768px)').matches || isClosing) return false;
    const el = target as HTMLElement | null;
    if (!el) return false;
    if (el.closest('.booking-modal__close')) return false;
    if (el.closest('.booking-modal__header')) return true;
    if (el.closest('button, a, input, textarea, select')) return false;
    return (bodyRef.current?.scrollTop ?? 0) <= 0;
  };

  const onSheetPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!canStartSheetDrag(e.target) || e.button !== 0) return;
    dragRef.current = { active: true, startY: e.clientY, offset: 0 };
    setDragOffset(0);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onSheetPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current.active) return;
    const delta = Math.max(0, e.clientY - dragRef.current.startY);
    dragRef.current.offset = delta;
    setDragOffset(delta);
  };

  const onSheetPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current.active) return;
    dragRef.current.active = false;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    if (dragRef.current.offset > 100) {
      requestClose();
      return;
    }
    setDragOffset(0);
  };

  const onSheetPointerCancel = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current.active) return;
    dragRef.current.active = false;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    setDragOffset(0);
  };

  if (!isPresent) return null;

  return (
    <div className={`booking-modal${isClosing ? ' is-closing' : ''}`} onClick={requestClose}>
      <div
        ref={dialogRef}
        className={`booking-modal__panel${isClosing ? ' is-closing' : ''}${dragOffset > 0 ? ' is-dragging' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        style={dragOffset > 0 && !isClosing ? { transform: `translateY(${dragOffset}px)` } : undefined}
        onClick={(e) => e.stopPropagation()}
        onPointerDown={onSheetPointerDown}
        onPointerMove={onSheetPointerMove}
        onPointerUp={onSheetPointerUp}
        onPointerCancel={onSheetPointerCancel}
      >
        <header className="booking-modal__header">
          <div>
            <p className="booking-modal__eyebrow">General inquiry</p>
            <h2 id={titleId} className="booking-modal__title">
              {getModalTitle(phase, site.sections.generalContactCard.title)}
            </h2>
          </div>
          <button
            type="button"
            className="booking-modal__close"
            onClick={(e) => {
              e.stopPropagation();
              requestClose();
            }}
            aria-label="Close"
          >
            ×
          </button>
        </header>

        {phase === 'form' ? (
          <form className="booking-modal__form" onSubmit={onSubmit} noValidate>
            <div className="booking-honeypot" aria-hidden="true">
              <label>
                Website
                <input
                  tabIndex={-1}
                  autoComplete="off"
                  name="website"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                />
              </label>
            </div>

            <div ref={bodyRef} className="booking-modal__body">
              <div className="booking-modal__fields">
                <ContactField label="Name" name="name" error={fieldErrors.name}>
                  <input
                    type="text"
                    autoComplete="name"
                    className="booking-field__input"
                    value={form.name}
                    minLength={2}
                    maxLength={100}
                    onChange={(e) => updateField('name', e.target.value)}
                    {...fieldInputProps('name', fieldErrors.name)}
                  />
                </ContactField>

                <ContactField label="Email" name="email" error={fieldErrors.email}>
                  <input
                    type="email"
                    autoComplete="email"
                    inputMode="email"
                    className="booking-field__input"
                    value={form.email}
                    maxLength={254}
                    onChange={(e) => updateField('email', e.target.value)}
                    {...fieldInputProps('email', fieldErrors.email)}
                  />
                </ContactField>

                <ContactField label="Message" name="message" error={fieldErrors.message}>
                  <textarea
                    rows={5}
                    className="booking-field__textarea"
                    value={form.message}
                    minLength={10}
                    maxLength={2000}
                    onChange={(e) => updateField('message', e.target.value)}
                    {...fieldInputProps('message', fieldErrors.message)}
                  />
                </ContactField>
              </div>
            </div>

            {submitError ? (
              <p className="booking-modal__error" role="alert">
                {submitError}
              </p>
            ) : null}

            <div className="booking-modal__actions">
              <span />
              <Button type="submit">{site.sections.generalContactCard.button}</Button>
            </div>
          </form>
        ) : phase === 'verify' ? (
          <div className="booking-modal__phase" aria-live="polite">
            <p className="booking-modal__phase-lead">Complete the quick check below, then we&apos;ll send your message.</p>
            <TurnstileField
              ref={turnstileRef}
              key={turnstileKey}
              hideLabel
              onToken={onTurnstileToken}
              onExpire={onTurnstileExpire}
              onError={onTurnstileError}
            />
            {turnstileError ? (
              <p className="booking-field__error booking-turnstile__error" role="alert">
                {turnstileError}
              </p>
            ) : null}
          </div>
        ) : phase === 'sending' ? (
          <div className="booking-modal__phase booking-modal__phase--sending" aria-live="polite">
            <p className="booking-modal__phase-lead">Sending your message…</p>
            <div className="booking-modal__spinner" aria-hidden="true" />
          </div>
        ) : (
          <BookingStepReveal stepKey="success" className="booking-modal__success">
            <BookingRevealItem index={0}>
              <p>
                Thanks, {form.name.split(' ')[0] || form.name}! We received your message and sent a confirmation to{' '}
                {form.email}.
              </p>
            </BookingRevealItem>
            <BookingRevealItem index={1}>
              <p className="booking-modal__success-note">{site.generalContact.responseTime}</p>
            </BookingRevealItem>
          </BookingStepReveal>
        )}
      </div>
    </div>
  );
}
