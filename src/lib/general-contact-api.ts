import type { GeneralContactForm } from '@/lib/general-contact-validation';

export type GeneralContactSubmitMeta = {
  turnstileToken?: string;
  openedAt: number;
  website?: string;
};

export const EMPTY_GENERAL_CONTACT: GeneralContactForm = {
  name: '',
  email: '',
  message: '',
};

export async function submitGeneralContact(
  form: GeneralContactForm,
  meta: GeneralContactSubmitMeta,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const apiUrl = import.meta.env.VITE_GENERAL_CONTACT_API_URL?.trim();
  if (!apiUrl) {
    return { ok: false, error: 'Contact form is not configured yet. Please email us directly.' };
  }

  const response = await fetch(`${apiUrl.replace(/\/$/, '')}/api/general-contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: form.name.trim(),
      email: form.email.trim(),
      message: form.message.trim(),
      turnstileToken: meta.turnstileToken,
      openedAt: meta.openedAt,
      website: meta.website ?? '',
    }),
  });

  const payload = (await response.json().catch(() => ({}))) as { error?: string; message?: string };
  if (!response.ok) {
    return { ok: false, error: payload.error ?? 'Something went wrong. Please try again.' };
  }

  return { ok: true };
}
