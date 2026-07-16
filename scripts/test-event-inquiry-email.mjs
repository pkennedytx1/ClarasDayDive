#!/usr/bin/env node
/**
 * Send a one-off test of the event inquiry emails via SES.
 *
 * Usage:
 *   node scripts/test-event-inquiry-email.mjs
 *   node scripts/test-event-inquiry-email.mjs --guest pkennedytx1@gmail.com
 *
 * Until events@clarasdaydive.com is verified in SES, this uses pkennedytx1@gmail.com as From.
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const config = JSON.parse(
  readFileSync(join(root, 'packages/event-booking/inquiry-config.json'), 'utf8'),
);

const guestArg = process.argv.find((arg) => arg.startsWith('--guest='))?.split('=')[1]
  ?? process.argv[process.argv.indexOf('--guest') + 1];
const guestEmail = guestArg || config.staffEmail;

// Gmail cannot be used as From via SES — Gmail silently drops third-party sends (DMARC).
// Default to a verified domain until clarasdaydive.com is verified in SES.
const testFromEmail = process.env.EVENT_TEST_FROM?.trim() || 'noreply@ninebars.tech';
const from = `${config.siteName} <${testFromEmail}>`;

const sample = {
  name: 'Test Guest',
  email: guestEmail,
  phone: '(512) 555-0199',
  company: 'Test Co',
  eventDate: '2026-08-15',
  startTime: '18:00',
  endTime: '22:00',
  guestCount: 24,
  description: 'Birthday patio hang with friends.',
  additionalInfo: 'Need one microphone if possible.',
};

function formatTime(time) {
  const match = String(time).trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return time;
  const hour24 = Number(match[1]);
  const minute = match[2];
  const period = hour24 >= 12 ? 'PM' : 'AM';
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  return `${hour12}:${minute} ${period}`;
}

function formatTimeRange(startTime, endTime) {
  return `${formatTime(startTime)} – ${formatTime(endTime)}`;
}

function shell(title, body) {
  return `<!DOCTYPE html><html><body style="margin:0;padding:24px;background:#EDE5CF;font-family:Georgia,serif;color:#1C1C1A;">
    <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:22px;overflow:hidden;box-shadow:0 12px 28px rgba(28,28,26,0.10);">
      <div style="padding:24px;background:linear-gradient(160deg,#C2556A,#A8455A);color:#fff;">
        <p style="margin:0 0 8px;font:700 11px Arial;letter-spacing:0.12em;text-transform:uppercase;">Clara's Day Dive</p>
        <h1 style="margin:0;font:italic 700 28px Georgia;">${title}</h1>
      </div>
      <div style="padding:24px;font:16px/1.6 Arial,sans-serif;">${body}</div>
    </div>
  </body></html>`;
}

const staffHtml = shell(
  'New event request',
  `<p>A guest submitted an event inquiry (test).</p>
   <p><strong>${sample.name}</strong><br>${sample.email}<br>${sample.phone}</p>
   <p>${sample.eventDate} · ${formatTimeRange(sample.startTime, sample.endTime)} · ${sample.guestCount} guests</p>
   <p>${sample.description}</p>`,
);

const guestHtml = shell(
  'We got your request',
  `<p>Hi ${sample.name},</p>
   <p>Thanks for reaching out about hosting an event at <strong>${config.siteName}</strong>. We've received your details and we're reviewing them now.</p>
   <p>${config.responseTime}</p>
   <p style="color:#6B6B66;font-size:14px;">This is a test email sent while we verify events@clarasdaydive.com in SES.</p>`,
);

const ses = new SESClient({ region: process.env.AWS_REGION || 'us-east-2' });

console.log(`From: ${from}`);
console.log(`Staff to: ${config.staffEmail}`);
console.log(`Guest receipt to: ${guestEmail}`);
console.log('Sending…');

await ses.send(
  new SendEmailCommand({
    Source: from,
    Destination: { ToAddresses: [config.staffEmail] },
    ReplyToAddresses: [sample.email],
    Message: {
      Subject: { Data: `[TEST] New event request — ${sample.name}`, Charset: 'UTF-8' },
      Body: {
        Html: { Data: staffHtml, Charset: 'UTF-8' },
        Text: { Data: `Test staff inquiry from ${sample.name}`, Charset: 'UTF-8' },
      },
    },
  }),
);

await ses.send(
  new SendEmailCommand({
    Source: from,
    Destination: { ToAddresses: [guestEmail] },
    ReplyToAddresses: [testFromEmail],
    Message: {
      Subject: { Data: `[TEST] We received your event request — ${config.siteName}`, Charset: 'UTF-8' },
      Body: {
        Html: { Data: guestHtml, Charset: 'UTF-8' },
        Text: { Data: `Test guest receipt for ${sample.name}`, Charset: 'UTF-8' },
      },
    },
  }),
);

console.log('Done — check both inboxes (and spam).');
