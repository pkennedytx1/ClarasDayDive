#!/usr/bin/env node
/**
 * Send a one-off test of the general contact emails via SES (with inline logo).
 *
 * Usage:
 *   npm run test:general-email
 *   node scripts/test-general-contact-email.ts
 *   node scripts/test-general-contact-email.ts --guest pkennedytx1@gmail.com
 *
 * Until info@clarasdaydive.com is verified in SES, set GENERAL_TEST_FROM to a verified address.
 */
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SESClient } from '@aws-sdk/client-ses';
import contactConfig from '../packages/general-contact/general-contact-config.json' with { type: 'json' };
import { guestGeneralReceiptEmail, staffGeneralContactEmail } from '../packages/general-contact/email-templates.js';
import { sendBrandedEmail } from '../packages/event-booking/email-send.js';
import type { GeneralContactConfig, GeneralContactPayload } from '../packages/general-contact/types.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const config = contactConfig as GeneralContactConfig;

const guestIdx = process.argv.indexOf('--guest');
const guestArg =
  process.argv.find((arg) => arg.startsWith('--guest='))?.split('=')[1]
  ?? (guestIdx >= 0 ? process.argv[guestIdx + 1] : undefined);
const guestEmail = guestArg || config.staffEmail;

const testFromEmail = process.env.GENERAL_TEST_FROM?.trim() || 'noreply@ninebars.tech';
const from = `${config.siteName} <${testFromEmail}>`;

const sample: GeneralContactPayload = {
  name: 'Test Guest',
  email: guestEmail,
  message: 'What are your hours on Sundays? Also — is the patio dog-friendly?',
};

const ses = new SESClient({ region: process.env.AWS_REGION || 'us-east-2' });
const staff = staffGeneralContactEmail(sample, config);
const guest = guestGeneralReceiptEmail(sample, config);

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
