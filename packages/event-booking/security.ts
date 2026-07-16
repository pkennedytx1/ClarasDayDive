const MIN_SUBMIT_MS = 3000;
const MAX_FORM_AGE_MS = 2 * 60 * 60 * 1000;
const MAX_BODY_BYTES = 12_000;

export function getClientIp(event: {
  requestContext?: { http?: { sourceIp?: string } };
  headers?: Record<string, string | undefined>;
}): string {
  const forwarded = event.headers?.['x-forwarded-for']?.split(',')[0]?.trim();
  return event.requestContext?.http?.sourceIp ?? forwarded ?? 'unknown';
}

export function checkPayloadSize(body: string): boolean {
  return body.length <= MAX_BODY_BYTES;
}

export function checkHoneypot(value: unknown): boolean {
  return String(value ?? '').trim() === '';
}

export function checkFormTiming(openedAt: unknown): boolean {
  const opened = Number(openedAt);
  if (!Number.isFinite(opened) || opened <= 0) return false;
  const elapsed = Date.now() - opened;
  return elapsed >= MIN_SUBMIT_MS && elapsed <= MAX_FORM_AGE_MS;
}

export function normalizeEmailKey(email: string): string {
  return email.trim().toLowerCase();
}

export function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}
