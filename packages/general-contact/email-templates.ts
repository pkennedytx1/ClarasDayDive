import type { GeneralContactConfig, GeneralContactPayload } from './types.js';
import { escapeHtml } from './security.js';

const BRAND = {
  nav: '#E3D8B5',
  cream: '#EDE5CF',
  ink: '#1C1C1A',
  rose: '#C2556A',
  roseDeep: '#A8455A',
  muted: '#6B6B66',
};

function shell(title: string, body: string, config: GeneralContactConfig): string {
  const siteName = escapeHtml(config.siteName || "Clara's Day Dive");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:${BRAND.nav};font-family:Georgia,'Times New Roman',serif;color:${BRAND.ink};">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:${BRAND.nav};padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;">
          <tr>
            <td align="center" style="padding:0 0 24px;">
              <img src="cid:claras-logo" alt="${siteName}" width="220" height="57" style="display:block;width:220px;max-width:72%;height:auto;border:0;" />
            </td>
          </tr>
          <tr>
            <td>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#ffffff;border-radius:22px;overflow:hidden;box-shadow:0 12px 28px rgba(28,28,26,0.10);">
                <tr>
                  <td style="padding:28px 28px 12px;background:linear-gradient(160deg,${BRAND.rose} 0%,${BRAND.roseDeep} 100%);color:#ffffff;">
                    <p style="margin:0 0 8px;font:700 11px/1.4 'Helvetica Neue',Arial,sans-serif;letter-spacing:0.12em;text-transform:uppercase;opacity:0.9;">${siteName}</p>
                    <h1 style="margin:0;font:italic 700 28px/1.15 Georgia,serif;">${title}</h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding:28px;font:16px/1.6 'Helvetica Neue',Arial,sans-serif;color:${BRAND.ink};">
                    ${body}
                  </td>
                </tr>
                <tr>
                  <td style="padding:0 28px 28px;font:13px/1.5 'Helvetica Neue',Arial,sans-serif;color:${BRAND.muted};">
                    ${siteName} · South Austin bar &amp; patio
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function detailRow(label: string, value: string): string {
  return `<tr>
    <td style="padding:10px 0;border-bottom:1px solid #E8E4DC;font:600 12px/1.4 'Helvetica Neue',Arial,sans-serif;color:${BRAND.muted};text-transform:uppercase;letter-spacing:0.06em;width:38%;vertical-align:top;">${label}</td>
    <td style="padding:10px 0 10px 12px;border-bottom:1px solid #E8E4DC;font:16px/1.5 'Helvetica Neue',Arial,sans-serif;color:${BRAND.ink};vertical-align:top;">${value}</td>
  </tr>`;
}

function detailsTable(rows: string): string {
  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:16px 0 0;">${rows}</table>`;
}

export function staffGeneralContactEmail(data: GeneralContactPayload, config: GeneralContactConfig) {
  const subject = `General inquiry — ${data.name}`;
  const rows = [
    detailRow('Name', escapeHtml(data.name)),
    detailRow('Email', `<a href="mailto:${escapeHtml(data.email)}" style="color:${BRAND.rose};">${escapeHtml(data.email)}</a>`),
    detailRow('Message', escapeHtml(data.message).replace(/\n/g, '<br />')),
  ].join('');

  const html = shell(
    'General inquiry',
    `<p style="margin:0 0 8px;">Someone sent a general message through the website contact form.</p>
     ${detailsTable(rows)}
     <p style="margin:20px 0 0;color:${BRAND.muted};font-size:14px;">Reply directly to <strong>${escapeHtml(data.email)}</strong> when you're ready.</p>`,
    config,
  );

  const text = [
    'General inquiry',
    '',
    `Name: ${data.name}`,
    `Email: ${data.email}`,
    `Message: ${data.message}`,
  ].join('\n');

  return { subject, html, text };
}

export function guestGeneralReceiptEmail(data: GeneralContactPayload, config: GeneralContactConfig) {
  const subject = `We received your message — ${config.siteName}`;
  const html = shell(
    'We got your message',
    `<p style="margin:0 0 12px;">Hi ${escapeHtml(data.name)},</p>
     <p style="margin:0 0 12px;">Thanks for reaching out to <strong>${escapeHtml(config.siteName)}</strong>. We've received your message and we're reviewing it now.</p>
     <p style="margin:0 0 12px;">${escapeHtml(config.responseTime)}</p>
     <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:20px 0 0;background:${BRAND.cream};border-radius:14px;">
       <tr>
         <td style="padding:18px 20px;font:15px/1.6 'Helvetica Neue',Arial,sans-serif;">
           <strong style="display:block;margin-bottom:6px;">Your message</strong>
           ${escapeHtml(data.message).replace(/\n/g, '<br />')}
         </td>
       </tr>
     </table>
     <p style="margin:20px 0 0;color:${BRAND.muted};font-size:14px;">If anything changes, reply to this email or write us at ${escapeHtml(config.fromEmail || 'info@clarasdaydive.com')}.</p>`,
    config,
  );

  const text = [
    `Hi ${data.name},`,
    '',
    `Thanks for reaching out to ${config.siteName}. We've received your message and we're reviewing it now.`,
    config.responseTime,
    '',
    `Your message: ${data.message}`,
  ].join('\n');

  return { subject, html, text };
}
