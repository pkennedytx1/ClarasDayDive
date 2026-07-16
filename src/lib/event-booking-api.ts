export type EventInquiryForm = {
  name: string;
  email: string;
  phone: string;
  company: string;
  eventDate: string;
  startTime: string;
  endTime: string;
  guestCount: string;
  description: string;
  additionalInfo: string;
};

export type EventInquirySubmitMeta = {
  turnstileToken?: string;
  openedAt: number;
  website?: string;
};

export const EMPTY_EVENT_INQUIRY: EventInquiryForm = {
  name: '',
  email: '',
  phone: '',
  company: '',
  eventDate: '',
  startTime: '',
  endTime: '',
  guestCount: '',
  description: '',
  additionalInfo: '',
};

export async function submitEventInquiry(
  form: EventInquiryForm,
  meta: EventInquirySubmitMeta,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const apiUrl = import.meta.env.VITE_EVENT_BOOKING_API_URL?.trim();
  if (!apiUrl) {
    return { ok: false, error: 'Event booking is not configured yet. Please call or email us directly.' };
  }

  const guestCount = Number(form.guestCount);
  const response = await fetch(`${apiUrl.replace(/\/$/, '')}/api/event-inquiry`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      company: form.company.trim() || undefined,
      eventDate: form.eventDate,
      startTime: form.startTime,
      endTime: form.endTime,
      guestCount,
      description: form.description.trim(),
      additionalInfo: form.additionalInfo.trim() || undefined,
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
