#!/usr/bin/env node
/**
 * Send a one-off test of the event inquiry emails via SES (with inline logo).
 *
 * Usage:
 *   npm run test:email
 *   node scripts/test-event-inquiry-email.mjs
 *   node scripts/test-event-inquiry-email.mjs --guest pkennedytx1@gmail.com
 *
 * Until events@clarasdaydive.com is verified in SES, set EVENT_TEST_FROM to a verified address.
 */
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SESClient } from '@aws-sdk/client-ses';
import inquiryConfig from '../packages/event-booking/inquiry-config.json' with { type: 'json' };
import { guestReceiptEmail, staffInquiryEmail } from '../packages/event-booking/email-templates.js';
import { sendBrandedEmail } from '../packages/event-booking/email-send.js';
import type { EventInquiryPayload, InquiryConfig } from '../packages/event-booking/types.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const config = inquiryConfig as InquiryConfig;

const guestIdx = process.argv.indexOf('--guest');
const guestArg =
  process.argv.find((arg) => arg.startsWith('--guest='))?.split('=')[1]
  ?? (guestIdx >= 0 ? process.argv[guestIdx + 1] : undefined);
const guestEmail = guestArg || config.staffEmail;

const testFromEmail = process.env.EVENT_TEST_FROM?.trim() || 'noreply@ninebars.tech';
const from = `${config.siteName} <${testFromEmail}>`;

const sample: EventInquiryPayload = {
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

const ses = new SESClient({ region: process.env.AWS_REGION || 'us-east-2' });
const staff = staffInquiryEmail(sample, config);
const guest = guestReceiptEmail(sample, config);

console.log(`From: ${from}`);
console.log(`Staff to: ${config.staffEmail}`);
console.log(`Guest receipt to: ${guestEmail}`);
console.log(`Logo: ${join(root, 'packages/event-booking/assets/wordmark-color.png')}`);
console.log('Sending…');

await sendBrandedEmail(ses, {
  from,
  to: config.staffEmail,
  replyTo: sample.email,
  subject: `[TEST] ${staff.subject}`,
  html: staff.html,
  text: staff.text,
});

await sendBrandedEmail(ses, {
  from,
  to: guestEmail,
  replyTo: testFromEmail,
  subject: `[TEST] ${guest.subject}`,
  html: guest.html,
  text: guest.text,
});

console.log('Done — check both inboxes (and spam).');
