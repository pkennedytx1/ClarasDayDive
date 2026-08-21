import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { SESClient } from '@aws-sdk/client-ses';
import contactConfig from './general-contact-config.json' with { type: 'json' };
import { guestGeneralReceiptEmail, staffGeneralContactEmail } from './email-templates.js';
import { sendBrandedEmail } from '../event-booking/email-send.js';
import { checkRateLimit } from './rate-limit.js';
import {
  checkFormTiming,
  checkHoneypot,
  checkPayloadSize,
  getClientIp,
  normalizeEmailKey,
} from './security.js';
import { isTurnstileRequired, verifyTurnstileToken } from './turnstile.js';
import type { GeneralContactConfig } from './types.js';
import { validateContact } from './validate.js';

const ses = new SESClient({});
const config = contactConfig as GeneralContactConfig;

const JSON_HEADERS = { 'Content-Type': 'application/json' };
const IP_LIMIT = 5;
const IP_WINDOW_MS = 10 * 60_000;
const EMAIL_LIMIT = 2;
const EMAIL_WINDOW_MS = 60 * 60_000;

function json(statusCode: number, body: Record<string, unknown>): APIGatewayProxyResultV2 {
  return { statusCode, headers: JSON_HEADERS, body: JSON.stringify(body) };
}

function getFromAddress(cfg: GeneralContactConfig): string {
  const email = cfg.fromEmail?.trim() || 'info@clarasdaydive.com';
  const name = cfg.siteName?.trim() || "Clara's Day Dive";
  return `${name} <${email}>`;
}

export async function handler(event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> {
  if (event.requestContext.http.method === 'OPTIONS') {
    return { statusCode: 204, headers: JSON_HEADERS, body: '' };
  }

  if (!event.body) {
    return json(400, { error: 'Missing request body.' });
  }

  if (!checkPayloadSize(event.body)) {
    return json(413, { error: 'Request is too large.' });
  }

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(event.body) as Record<string, unknown>;
  } catch {
    return json(400, { error: 'Invalid JSON body.' });
  }

  if (!checkHoneypot(parsed.website)) {
    return json(400, { error: 'Unable to submit this request.' });
  }

  if (!checkFormTiming(parsed.openedAt)) {
    return json(400, { error: 'Please take a moment to complete the form before submitting.' });
  }

  const ip = getClientIp(event);
  const usageTable = process.env.GENERAL_CONTACT_USAGE_TABLE?.trim();
  if (usageTable) {
    const ipAllowed = await checkRateLimit(usageTable, `CONTACT#IP#${ip}`, IP_LIMIT, IP_WINDOW_MS);
    if (!ipAllowed) {
      return json(429, { error: 'Too many requests. Please wait a few minutes and try again.' });
    }
  }

  const turnstileToken = String(parsed.turnstileToken ?? '');
  if (isTurnstileRequired()) {
    const verified = await verifyTurnstileToken(turnstileToken, ip);
    if (!verified) {
      return json(400, { error: 'Human verification failed. Please try again.' });
    }
  }

  const result = validateContact(parsed);
  if (!result.ok) {
    return json(400, { error: result.error });
  }

  if (usageTable) {
    const emailAllowed = await checkRateLimit(
      usageTable,
      `CONTACT#EMAIL#${normalizeEmailKey(result.data.email)}`,
      EMAIL_LIMIT,
      EMAIL_WINDOW_MS,
    );
    if (!emailAllowed) {
      return json(429, { error: 'A message was recently sent for this email. Please try again later.' });
    }
  }

  const staff = staffGeneralContactEmail(result.data, config);
  const guest = guestGeneralReceiptEmail(result.data, config);
  const from = getFromAddress(config);
  const replyTo = config.fromEmail?.trim() || 'info@clarasdaydive.com';

  try {
    await sendBrandedEmail(ses, {
      from,
      to: config.staffEmail,
      replyTo: result.data.email,
      subject: staff.subject,
      html: staff.html,
      text: staff.text,
    });

    await sendBrandedEmail(ses, {
      from,
      to: result.data.email,
      replyTo,
      subject: guest.subject,
      html: guest.html,
      text: guest.text,
    });
  } catch (err) {
    console.error('SES send failed', err);
    return json(502, { error: 'Unable to send your message right now. Please try again shortly.' });
  }

  return json(200, { ok: true, message: 'Your message was sent.' });
}
