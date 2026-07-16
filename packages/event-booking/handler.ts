import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import inquiryConfig from './inquiry-config.json' with { type: 'json' };
import { guestReceiptEmail, staffInquiryEmail } from './email-templates.js';
import { checkRateLimit } from './rate-limit.js';
import {
  checkFormTiming,
  checkHoneypot,
  checkPayloadSize,
  getClientIp,
  normalizeEmailKey,
} from './security.js';
import { isTurnstileRequired, verifyTurnstileToken } from './turnstile.js';
import type { InquiryConfig } from './types.js';
import { validateInquiry } from './validate.js';

const ses = new SESClient({});
const config = inquiryConfig as InquiryConfig;

const JSON_HEADERS = { 'Content-Type': 'application/json' };
const IP_LIMIT = 5;
const IP_WINDOW_MS = 10 * 60_000;
const EMAIL_LIMIT = 2;
const EMAIL_WINDOW_MS = 60 * 60_000;

function json(statusCode: number, body: Record<string, unknown>): APIGatewayProxyResultV2 {
  return { statusCode, headers: JSON_HEADERS, body: JSON.stringify(body) };
}

function getFromAddress(cfg: InquiryConfig): string {
  const email = cfg.fromEmail?.trim() || 'events@clarasdaydive.com';
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
  const usageTable = process.env.EVENT_BOOKING_USAGE_TABLE?.trim();
  if (usageTable) {
    const ipAllowed = await checkRateLimit(usageTable, `EVENT#IP#${ip}`, IP_LIMIT, IP_WINDOW_MS);
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

  const result = validateInquiry(parsed);
  if (!result.ok) {
    return json(400, { error: result.error });
  }

  if (usageTable) {
    const emailAllowed = await checkRateLimit(
      usageTable,
      `EVENT#EMAIL#${normalizeEmailKey(result.data.email)}`,
      EMAIL_LIMIT,
      EMAIL_WINDOW_MS,
    );
    if (!emailAllowed) {
      return json(429, { error: 'An event request was recently sent for this email. Please try again later.' });
    }
  }

  const staff = staffInquiryEmail(result.data, config);
  const guest = guestReceiptEmail(result.data, config);
  const from = getFromAddress(config);
  const replyTo = config.fromEmail?.trim() || 'events@clarasdaydive.com';

  try {
    await ses.send(
      new SendEmailCommand({
        Source: from,
        Destination: { ToAddresses: [config.staffEmail] },
        ReplyToAddresses: [result.data.email],
        Message: {
          Subject: { Data: staff.subject, Charset: 'UTF-8' },
          Body: {
            Html: { Data: staff.html, Charset: 'UTF-8' },
            Text: { Data: staff.text, Charset: 'UTF-8' },
          },
        },
      }),
    );

    await ses.send(
      new SendEmailCommand({
        Source: from,
        Destination: { ToAddresses: [result.data.email] },
        ReplyToAddresses: [replyTo],
        Message: {
          Subject: { Data: guest.subject, Charset: 'UTF-8' },
          Body: {
            Html: { Data: guest.html, Charset: 'UTF-8' },
            Text: { Data: guest.text, Charset: 'UTF-8' },
          },
        },
      }),
    );
  } catch (err) {
    console.error('SES send failed', err);
    return json(502, { error: 'Unable to send your request right now. Please try again shortly.' });
  }

  return json(200, { ok: true, message: 'Your event request was sent.' });
}
