import type { EventInquiryPayload } from './types.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^\d{2}:\d{2}$/;

function phoneDigits(value: string): string {
  return value.replace(/\D/g, '');
}

function isValidPhone(value: string): boolean {
  return phoneDigits(value).length === 10;
}

function minutesFromTime(value: string): number | null {
  const match = value.match(/^(\d{2}):(\d{2})$/);
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

export function validateInquiry(body: unknown): { ok: true; data: EventInquiryPayload } | { ok: false; error: string } {
  if (!body || typeof body !== 'object') {
    return { ok: false, error: 'Invalid request body.' };
  }

  const raw = body as Record<string, unknown>;
  const name = String(raw.name ?? '').trim();
  const email = String(raw.email ?? '').trim();
  const phone = String(raw.phone ?? '').trim();
  const company = String(raw.company ?? '').trim();
  const eventDate = String(raw.eventDate ?? '').trim();
  const startTime = String(raw.startTime ?? '').trim();
  const endTime = String(raw.endTime ?? '').trim();
  const description = String(raw.description ?? '').trim();
  const additionalInfo = String(raw.additionalInfo ?? '').trim();
  const guestCount = Number(raw.guestCount);

  if (!name || name.length < 2 || name.length > 100) return { ok: false, error: 'Please enter a valid name.' };
  if (!email || !EMAIL_RE.test(email) || email.length > 254) {
    return { ok: false, error: 'A valid email is required.' };
  }
  if (!phone || !isValidPhone(phone) || phone.length > 30) {
    return { ok: false, error: 'A valid phone number is required.' };
  }
  if (company.length > 100) return { ok: false, error: 'Company name is too long.' };
  if (!eventDate || !DATE_RE.test(eventDate) || isPastDate(eventDate)) {
    return { ok: false, error: 'Please choose a valid event date.' };
  }
  if (!startTime || !TIME_RE.test(startTime)) return { ok: false, error: 'Start time is required.' };
  if (!endTime || !TIME_RE.test(endTime)) return { ok: false, error: 'End time is required.' };

  const startMinutes = minutesFromTime(startTime);
  const endMinutes = minutesFromTime(endTime);
  if (startMinutes === null || endMinutes === null || endMinutes <= startMinutes) {
    return { ok: false, error: 'End time must be after start time.' };
  }

  if (!Number.isFinite(guestCount) || guestCount < 1 || guestCount > 500) {
    return { ok: false, error: 'Guest count must be between 1 and 500.' };
  }
  if (!description || description.length < 10 || description.length > 2000) {
    return { ok: false, error: 'Please provide an event description.' };
  }
  if (additionalInfo.length > 2000) {
    return { ok: false, error: 'Additional notes are too long.' };
  }

  return {
    ok: true,
    data: {
      name,
      email,
      phone,
      company: company || undefined,
      eventDate,
      startTime,
      endTime,
      guestCount: Math.round(guestCount),
      description,
      additionalInfo: additionalInfo || undefined,
    },
  };
}
