import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SESClient, SendRawEmailCommand } from '@aws-sdk/client-ses';

const LOGO_CID = 'claras-logo';
const packageDir = dirname(fileURLToPath(import.meta.url));

function formatAddress(name: string, email: string): string {
  const safeName = name.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  return `"${safeName}" <${email}>`;
}

function formatFromHeader(from: string): string {
  const match = from.match(/^(.+?)\s*<([^>]+)>$/);
  if (!match) return from;
  const name = match[1].trim().replace(/^"|"$/g, '');
  return formatAddress(name, match[2].trim());
}

export function loadLogoBuffer(): Buffer {
  return readFileSync(join(packageDir, 'assets/wordmark-color.png'));
}

export function buildRawEmail(params: {
  from: string;
  to: string;
  replyTo?: string;
  subject: string;
  html: string;
  text: string;
  logo: Buffer;
}): Uint8Array {
  const { from, to, replyTo, subject, html, text, logo } = params;
  const boundary = `----=_Claras_${Date.now()}`;
  const altBoundary = `${boundary}_alt`;
  const logoBase64 = logo.toString('base64');

  const lines = [
    `From: ${formatFromHeader(from)}`,
    `To: ${to}`,
    ...(replyTo ? [`Reply-To: ${replyTo}`] : []),
    `Subject: ${subject}`,
    'MIME-Version: 1.0',
    `Content-Type: multipart/related; boundary="${boundary}"`,
    '',
    `--${boundary}`,
    `Content-Type: multipart/alternative; boundary="${altBoundary}"`,
    '',
    `--${altBoundary}`,
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 7bit',
    '',
    text,
    '',
    `--${altBoundary}`,
    'Content-Type: text/html; charset=UTF-8',
    'Content-Transfer-Encoding: 7bit',
    '',
    html,
    '',
    `--${altBoundary}--`,
    `--${boundary}`,
    'Content-Type: image/png; name="wordmark-color.png"',
    'Content-Transfer-Encoding: base64',
    `Content-ID: <${LOGO_CID}>`,
    'Content-Disposition: inline; filename="wordmark-color.png"',
    '',
    logoBase64,
    `--${boundary}--`,
    '',
  ];

  return Buffer.from(lines.join('\r\n'));
}

export async function sendBrandedEmail(
  ses: SESClient,
  params: {
    from: string;
    to: string;
    replyTo?: string;
    subject: string;
    html: string;
    text: string;
  },
): Promise<void> {
  const logo = loadLogoBuffer();
  const raw = buildRawEmail({ ...params, logo });
  await ses.send(
    new SendRawEmailCommand({
      RawMessage: { Data: raw },
    }),
  );
}

export { LOGO_CID };
