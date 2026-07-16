import { useCallback, useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { Button } from '@/components/Button';
import { BookingRevealItem, BookingStepReveal } from '@/components/BookingStepReveal';
import { TurnstileField, getTurnstileSiteKey, type TurnstileFieldHandle } from '@/components/TurnstileField';
import { getSiteContent } from '@/lib/content';
import {
  EMPTY_EVENT_INQUIRY,
  submitEventInquiry,
  type EventInquiryForm,
} from '@/lib/event-booking-api';
import { formatPhoneInput } from '@/lib/phone-format';
import { BOOKING_STEPS } from '@/lib/event-booking-steps';
import {
  hasFieldErrors,
  validateContactStep,
  validateEventStep,
  validateStep,
  type BookingFieldName,
  type FieldErrors,
} from '@/lib/event-booking-validation';

interface EventBookingModalProps {
  open: boolean;
  onClose: () => void;
}

function todayInputValue(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function formatReviewDate(value: string): string {
  if (!value) return '—';
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatReviewTime(value: string): string {
  if (!value) return '—';
  const [hour, minute] = value.split(':').map(Number);
  const d = new Date();
  d.setHours(hour, minute, 0, 0);
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function StepHeading({ title, hint }: { title: string; hint: string }) {
  return (
    <div className="booking-modal__step-head">
      <h3 className="booking-modal__step-title">{title}</h3>
      <p className="booking-modal__step-hint">{hint}</p>
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  if (!value.trim()) return null;
  return (
    <div className="booking-review__row">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function BookingField({
  label,
  name,
  error,
  children,
}: {
  label: string;
  name: BookingFieldName;
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

function fieldInputProps(name: BookingFieldName, error?: string) {
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

type BookingPhase = 'form' | 'verify' | 'sending' | 'success';

function getModalTitle(phase: BookingPhase, fallback: string): string {
  switch (phase) {
    case 'verify':
      return "Verifying you're human";
    case 'sending':
      return 'Sending your request';
    case 'success':
      return 'Request sent';
    default:
      return fallback;
  }
}

function getCloseDuration(): number {
  if (typeof window === 'undefined') return CLOSE_ANIM_MS;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : CLOSE_ANIM_MS;
}

export function EventBookingModal({ open, onClose }: EventBookingModalProps) {
  const site = getSiteContent();
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const openedAtRef = useRef(0);
  const dragRef = useRef({ active: false, startY: 0, offset: 0 });
  const turnstileRef = useRef<TurnstileFieldHandle>(null);
  const failCloseTimerRef = useRef<number | null>(null);
  const turnstileRequired = Boolean(getTurnstileSiteKey());

  const [step, setStep] = useState(0);
  const [phase, setPhase] = useState<BookingPhase>('form');
  const [form, setForm] = useState<EventInquiryForm>(EMPTY_EVENT_INQUIRY);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [turnstileError, setTurnstileError] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState(0);
  const [honeypot, setHoneypot] = useState('');
  const [turnstileKey, setTurnstileKey] = useState(0);
  const [isPresent, setIsPresent] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const minEventDate = todayInputValue();

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
    setStep(0);
    setPhase('form');
    setForm(EMPTY_EVENT_INQUIRY);
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
    return () => {
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [isPresent, isClosing, requestClose, step, phase]);

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

  const focusFirstError = (errors: FieldErrors) => {
    const firstKey = Object.keys(errors)[0] as BookingFieldName | undefined;
    if (!firstKey || !bodyRef.current) return;
    const input = bodyRef.current.querySelector<HTMLElement>(`[name="${firstKey}"]`);
    input?.focus();
  };

  const updateField = (field: BookingFieldName, value: string) => {
    const nextValue = field === 'phone' ? formatPhoneInput(value) : value;
    setForm((prev) => ({ ...prev, [field]: nextValue }));
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
    setSubmitError(null);
  };

  const goNext = () => {
    const errors = validateStep(step, form);
    if (hasFieldErrors(errors)) {
      setFieldErrors(errors);
      focusFirstError(errors);
      return;
    }
    setStep((current) => Math.min(current + 1, BOOKING_STEPS.length - 1));
    setFieldErrors({});
    setSubmitError(null);
  };

  const goBack = () => {
    setStep((current) => Math.max(current - 1, 0));
    setFieldErrors({});
    setSubmitError(null);
    setTurnstileError(null);
  };

  const sendInquiry = useCallback(async (token: string) => {
    setPhase('sending');
    setSubmitError(null);
    setTurnstileError(null);
    const result = await submitEventInquiry(form, {
      turnstileToken: token || undefined,
      openedAt: openedAtRef.current,
      website: honeypot,
    });

    if (!result.ok) {
      setSubmitError(result.error);
      setTurnstileKey((current) => current + 1);
      setPhase('form');
      setStep(BOOKING_STEPS.length - 1);
      return;
    }

    setPhase('success');
  }, [form, honeypot]);

  const onTurnstileToken = useCallback(
    (token: string) => {
      setTurnstileError(null);
      setSubmitError(null);
      void sendInquiry(token);
    },
    [sendInquiry],
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
    void sendInquiry('');
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (phase !== 'form') return;

    if (step < BOOKING_STEPS.length - 1) {
      goNext();
      return;
    }

    const contactErrors = validateContactStep(form);
    const eventErrors = validateEventStep(form);
    const errors = { ...contactErrors, ...eventErrors };
    if (hasFieldErrors(errors)) {
      setFieldErrors(errors);
      setSubmitError(null);
      setTurnstileError(null);
      if (Object.keys(contactErrors).length) setStep(0);
      else if (Object.keys(eventErrors).length) setStep(1);
      focusFirstError(errors);
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
    if (el.closest('.booking-modal__progress')) return true;
    if (el.closest('.booking-modal__progress-label')) return true;
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

  const currentStep = BOOKING_STEPS[step];

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
            <p className="booking-modal__eyebrow">Event questionnaire</p>
            <h2 id={titleId} className="booking-modal__title">
              {getModalTitle(phase, site.sections.contact.title)}
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
          <>
            <div className="booking-modal__progress" aria-hidden="true">
              {BOOKING_STEPS.map((item, index) => (
                <span
                  key={item.id}
                  className={`booking-modal__step${index === step ? ' is-active' : ''}${index < step ? ' is-done' : ''}`}
                />
              ))}
            </div>
            <p className="booking-modal__progress-label" aria-live="polite">
              Step {step + 1} of {BOOKING_STEPS.length}: {currentStep.title}
            </p>

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
                {step === 0 ? (
                  <BookingStepReveal stepKey={step}>
                    <div className="booking-modal__fields">
                      <BookingRevealItem index={0}>
                        <StepHeading title="Contact information" hint="How we can reach you about your event." />
                      </BookingRevealItem>
                      <BookingRevealItem index={1}>
                        <BookingField label="Name" name="name" error={fieldErrors.name}>
                          <input
                            className="booking-field__input"
                            value={form.name}
                            onChange={(e) => updateField('name', e.target.value)}
                            autoComplete="name"
                            {...fieldInputProps('name', fieldErrors.name)}
                          />
                        </BookingField>
                      </BookingRevealItem>
                      <BookingRevealItem index={2}>
                        <BookingField label="Email" name="email" error={fieldErrors.email}>
                          <input
                            className="booking-field__input"
                            type="email"
                            value={form.email}
                            onChange={(e) => updateField('email', e.target.value)}
                            autoComplete="email"
                            {...fieldInputProps('email', fieldErrors.email)}
                          />
                        </BookingField>
                      </BookingRevealItem>
                      <BookingRevealItem index={3}>
                        <BookingField label="Phone number" name="phone" error={fieldErrors.phone}>
                          <input
                            className="booking-field__input"
                            type="tel"
                            value={form.phone}
                            onChange={(e) => updateField('phone', e.target.value)}
                            autoComplete="tel"
                            inputMode="tel"
                            {...fieldInputProps('phone', fieldErrors.phone)}
                          />
                        </BookingField>
                      </BookingRevealItem>
                      <BookingRevealItem index={4}>
                        <BookingField label="Company (if applicable)" name="company" error={fieldErrors.company}>
                          <input
                            className="booking-field__input"
                            value={form.company}
                            onChange={(e) => updateField('company', e.target.value)}
                            autoComplete="organization"
                            placeholder="Optional"
                            {...fieldInputProps('company', fieldErrors.company)}
                          />
                        </BookingField>
                      </BookingRevealItem>
                    </div>
                  </BookingStepReveal>
                ) : null}

                {step === 1 ? (
                  <BookingStepReveal stepKey={step}>
                    <div className="booking-modal__fields">
                      <BookingRevealItem index={0}>
                        <StepHeading title="Event details" hint="Tell us what you're planning and when." />
                      </BookingRevealItem>
                      <BookingRevealItem index={1}>
                        <BookingField label="Event date" name="eventDate" error={fieldErrors.eventDate}>
                          <input
                            className="booking-field__input"
                            type="date"
                            min={minEventDate}
                            value={form.eventDate}
                            onChange={(e) => updateField('eventDate', e.target.value)}
                            {...fieldInputProps('eventDate', fieldErrors.eventDate)}
                          />
                        </BookingField>
                      </BookingRevealItem>
                      <BookingRevealItem index={2} className="booking-modal__row">
                        <BookingField label="Start time" name="startTime" error={fieldErrors.startTime}>
                          <input
                            className="booking-field__input"
                            type="time"
                            value={form.startTime}
                            onChange={(e) => updateField('startTime', e.target.value)}
                            {...fieldInputProps('startTime', fieldErrors.startTime)}
                          />
                        </BookingField>
                        <BookingField label="End time" name="endTime" error={fieldErrors.endTime}>
                          <input
                            className="booking-field__input"
                            type="time"
                            value={form.endTime}
                            onChange={(e) => updateField('endTime', e.target.value)}
                            {...fieldInputProps('endTime', fieldErrors.endTime)}
                          />
                        </BookingField>
                      </BookingRevealItem>
                      <BookingRevealItem index={3}>
                        <BookingField label="Guest count" name="guestCount" error={fieldErrors.guestCount}>
                          <input
                            className="booking-field__input"
                            type="number"
                            min={1}
                            inputMode="numeric"
                            value={form.guestCount}
                            onChange={(e) => updateField('guestCount', e.target.value)}
                            placeholder="Estimated number of guests"
                            {...fieldInputProps('guestCount', fieldErrors.guestCount)}
                          />
                        </BookingField>
                      </BookingRevealItem>
                      <BookingRevealItem index={4}>
                        <BookingField label="Description of event" name="description" error={fieldErrors.description}>
                          <textarea
                            className="booking-field__textarea"
                            rows={4}
                            value={form.description}
                            onChange={(e) => updateField('description', e.target.value)}
                            placeholder="Birthday, watch party, private gathering…"
                            {...fieldInputProps('description', fieldErrors.description)}
                          />
                        </BookingField>
                      </BookingRevealItem>
                      <BookingRevealItem index={5}>
                        <BookingField
                          label="Additional notes about your event (optional)"
                          name="additionalInfo"
                          error={fieldErrors.additionalInfo}
                        >
                          <textarea
                            className="booking-field__textarea"
                            rows={4}
                            value={form.additionalInfo}
                            onChange={(e) => updateField('additionalInfo', e.target.value)}
                            placeholder="AV needs, catering, accessibility, setup preferences…"
                            {...fieldInputProps('additionalInfo', fieldErrors.additionalInfo)}
                          />
                        </BookingField>
                      </BookingRevealItem>
                    </div>
                  </BookingStepReveal>
                ) : null}

                {step === 2 ? (
                  <BookingStepReveal stepKey={step}>
                    <div className="booking-modal__review">
                      <BookingRevealItem index={0}>
                        <StepHeading title="Review your request" hint="Make sure everything looks right before you submit." />
                      </BookingRevealItem>
                      <BookingRevealItem index={1}>
                        <dl className="booking-review">
                          <ReviewRow label="Name" value={form.name} />
                          <ReviewRow label="Email" value={form.email} />
                          <ReviewRow label="Phone" value={form.phone} />
                          <ReviewRow label="Company" value={form.company} />
                          <ReviewRow label="Date" value={formatReviewDate(form.eventDate)} />
                          <ReviewRow
                            label="Time"
                            value={`${formatReviewTime(form.startTime)} – ${formatReviewTime(form.endTime)}`}
                          />
                          <ReviewRow label="Guest count" value={form.guestCount} />
                          <ReviewRow label="Description" value={form.description} />
                          <ReviewRow label="Additional notes" value={form.additionalInfo} />
                        </dl>
                      </BookingRevealItem>
                    </div>
                  </BookingStepReveal>
                ) : null}
              </div>

              {submitError ? (
                <p className="booking-modal__error" role="alert">
                  {submitError}
                </p>
              ) : null}

              <div className="booking-modal__actions">
                {step > 0 ? (
                  <Button type="button" variant="secondary" onClick={goBack}>
                    Back
                  </Button>
                ) : (
                  <span />
                )}
                <Button type="submit">
                  {step === BOOKING_STEPS.length - 1 ? 'Submit request' : 'Continue'}
                </Button>
              </div>
            </form>
          </>
        ) : phase === 'verify' ? (
          <div className="booking-modal__phase" aria-live="polite">
            <p className="booking-modal__phase-lead">Complete the quick check below, then we&apos;ll send your request.</p>
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
            <p className="booking-modal__phase-lead">Sending your event request…</p>
            <div className="booking-modal__spinner" aria-hidden="true" />
          </div>
        ) : (
          <BookingStepReveal stepKey="success" className="booking-modal__success">
            <BookingRevealItem index={0}>
              <p>
                Thanks, {form.name.split(' ')[0] || form.name}! We received your event request and sent a confirmation to{' '}
                {form.email}.
              </p>
            </BookingRevealItem>
            <BookingRevealItem index={1}>
              <p className="booking-modal__success-note">{site.contact.responseTime}</p>
            </BookingRevealItem>
          </BookingStepReveal>
        )}
      </div>
    </div>
  );
}
