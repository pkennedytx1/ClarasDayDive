import type { EventInquiryForm } from '@/lib/event-booking-api';
import { isValidPhoneNumber } from '@/lib/phone-format';

export type BookingFieldName = keyof EventInquiryForm;
export type FieldErrors = Partial<Record<BookingFieldName, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function minutesFromTime(value: string): number | null {
  const match = value.trim().match(/^(\d{2}):(\d{2})$/);
  if (!match) return null;
  return Number(match[1]) * 60 + Number(match[2]);
}

function isPastDate(value: string): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [year, month, day] = value.split('-').map(Number);
  const picked = new Date(year, month - 1, day);
  return picked < today;
}

export function validateContactStep(form: EventInquiryForm): FieldErrors {
  const errors: FieldErrors = {};
  const name = form.name.trim();
  const email = form.email.trim();
  const phone = form.phone.trim();
  const company = form.company.trim();

  if (!name) errors.name = 'Please enter your name.';
  else if (name.length < 2) errors.name = 'Name should be at least 2 characters.';
  else if (name.length > 100) errors.name = 'Name is too long.';

  if (!email) errors.email = 'Please enter your email.';
  else if (!EMAIL_RE.test(email)) errors.email = 'Please enter a valid email address.';

  if (!phone) errors.phone = 'Please enter a phone number.';
  else if (!isValidPhoneNumber(phone)) errors.phone = 'Please enter a 10-digit phone number.';

  if (company.length > 100) errors.company = 'Company name is too long.';

  return errors;
}

export function validateEventStep(form: EventInquiryForm): FieldErrors {
  const errors: FieldErrors = {};
  const description = form.description.trim();
  const additionalInfo = form.additionalInfo.trim();
  const guestCount = Number(form.guestCount);
  const startMinutes = minutesFromTime(form.startTime);
  const endMinutes = minutesFromTime(form.endTime);

  if (!form.eventDate) errors.eventDate = 'Please choose an event date.';
  else if (isPastDate(form.eventDate)) errors.eventDate = 'Event date must be today or later.';

  if (!form.startTime) errors.startTime = 'Please choose a start time.';
  if (!form.endTime) errors.endTime = 'Please choose an end time.';

  if (
    startMinutes !== null &&
    endMinutes !== null &&
    form.startTime &&
    form.endTime &&
    endMinutes <= startMinutes
  ) {
    errors.endTime = 'End time must be after start time.';
  }

  if (!form.guestCount) errors.guestCount = 'Please enter a guest count.';
  else if (!Number.isFinite(guestCount) || guestCount < 1) errors.guestCount = 'Guest count must be at least 1.';
  else if (guestCount > 500) errors.guestCount = 'For larger events, please call us directly.';

  if (!description) errors.description = 'Please describe your event.';
  else if (description.length < 10) errors.description = 'Add a little more detail about your event.';
  else if (description.length > 2000) errors.description = 'Description is too long.';

  if (additionalInfo.length > 2000) errors.additionalInfo = 'Additional notes are too long.';

  return errors;
}

export function validateStep(step: number, form: EventInquiryForm): FieldErrors {
  if (step === 0) return validateContactStep(form);
  if (step === 1) return validateEventStep(form);
  return {};
}

export function hasFieldErrors(errors: FieldErrors): boolean {
  return Object.keys(errors).length > 0;
}

export function firstFieldError(errors: FieldErrors): string | null {
  const first = Object.values(errors).find(Boolean);
  return first ?? null;
}
