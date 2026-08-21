import type { GeneralContactPayload } from './types.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateContact(
  body: unknown,
): { ok: true; data: GeneralContactPayload } | { ok: false; error: string } {
  if (!body || typeof body !== 'object') {
    return { ok: false, error: 'Invalid request body.' };
  }

  const raw = body as Record<string, unknown>;
  const name = String(raw.name ?? '').trim();
  const email = String(raw.email ?? '').trim();
  const message = String(raw.message ?? '').trim();

  if (!name || name.length < 2 || name.length > 100) {
    return { ok: false, error: 'Please enter a valid name.' };
  }
  if (!email || !EMAIL_RE.test(email) || email.length > 254) {
    return { ok: false, error: 'A valid email is required.' };
  }
  if (!message || message.length < 10 || message.length > 2000) {
    return { ok: false, error: 'Please enter a message (at least 10 characters).' };
  }

  return { ok: true, data: { name, email, message } };
}
