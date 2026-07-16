import type { EventInquiryPayload, InquiryConfig } from './types.js';
import { escapeHtml } from './security.js';

const BRAND = {
  nav: '#E3D8B5',
  cream: '#EDE5CF',
  ink: '#1C1C1A',
  rose: '#C2556A',
  roseDeep: '#A8455A',
  muted: '#6B6B66',
};

function siteLogoUrl(): string {
  // Inline CID attachment — see email-send.ts (loadLogoBuffer).
  return 'cid:claras-logo';
}

function formatDate(date: string): string {
  const [year, month, day] = date.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatTime(time: string): string {
  const match = String(time).trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return time;

  const hour24 = Number(match[1]);
  const minute = match[2];
  const period = hour24 >= 12 ? 'PM' : 'AM';
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;

  return `${hour12}:${minute} ${period}`;
}

function formatTimeRange(startTime: string, endTime: string): string {
  return `${formatTime(startTime)} – ${formatTime(endTime)}`;
}

function shell(title: string, body: string, config: InquiryConfig): string {
  const logoSrc = siteLogoUrl();
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
              <img src="${logoSrc}" alt="${siteName}" width="220" height="57" style="display:block;width:220px;max-width:72%;height:auto;border:0;" />
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

export function staffInquiryEmail(data: EventInquiryPayload, config: InquiryConfig) {
  const subject = `New event request — ${data.name} · ${formatDate(data.eventDate)}`;
  const rows = [
    detailRow('Name', escapeHtml(data.name)),
    detailRow('Email', `<a href="mailto:${escapeHtml(data.email)}" style="color:${BRAND.rose};">${escapeHtml(data.email)}</a>`),
    detailRow('Phone', escapeHtml(data.phone)),
    data.company ? detailRow('Company', escapeHtml(data.company)) : '',
    detailRow('Date', formatDate(data.eventDate)),
    detailRow('Time', formatTimeRange(data.startTime, data.endTime)),
    detailRow('Guests', String(data.guestCount)),
    detailRow('Description', escapeHtml(data.description).replace(/\n/g, '<br />')),
    data.additionalInfo ? detailRow('Notes', escapeHtml(data.additionalInfo).replace(/\n/g, '<br />')) : '',
  ].join('');

  const html = shell(
    'New event request',
    `<p style="margin:0 0 8px;">A guest submitted an event inquiry on the website.</p>
     ${detailsTable(rows)}
     <p style="margin:20px 0 0;color:${BRAND.muted};font-size:14px;">Reply directly to <strong>${escapeHtml(data.email)}</strong> when you're ready.</p>`,
    config,
  );

  const text = [
    'New event request',
    '',
    `Name: ${data.name}`,
    `Email: ${data.email}`,
    `Phone: ${data.phone}`,
    data.company ? `Company: ${data.company}` : '',
    `Date: ${formatDate(data.eventDate)}`,
    `Time: ${formatTimeRange(data.startTime, data.endTime)}`,
    `Guests: ${data.guestCount}`,
    `Description: ${data.description}`,
    data.additionalInfo ? `Notes: ${data.additionalInfo}` : '',
  ]
    .filter(Boolean)
    .join('\n');

  return { subject, html, text };
}

export function guestReceiptEmail(data: EventInquiryPayload, config: InquiryConfig) {
  const subject = `We received your event request — ${config.siteName}`;
  const html = shell(
    'We got your request',
    `<p style="margin:0 0 12px;">Hi ${escapeHtml(data.name)},</p>
     <p style="margin:0 0 12px;">Thanks for reaching out about hosting an event at <strong>${escapeHtml(config.siteName)}</strong>. We've received your details and we're reviewing them now.</p>
     <p style="margin:0 0 12px;">${escapeHtml(config.responseTime)}</p>
     <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:20px 0 0;background:${BRAND.cream};border-radius:14px;">
       <tr>
         <td style="padding:18px 20px;font:15px/1.6 'Helvetica Neue',Arial,sans-serif;">
           <strong style="display:block;margin-bottom:6px;">Your event</strong>
           ${formatDate(data.eventDate)} · ${formatTimeRange(data.startTime, data.endTime)}<br />
           ${data.guestCount} guests
         </td>
       </tr>
     </table>
     <p style="margin:20px 0 0;color:${BRAND.muted};font-size:14px;">If anything changes, reply to this email or write us at ${escapeHtml(config.fromEmail || 'events@clarasdaydive.com')}.</p>`,
    config,
  );

  const text = [
    `Hi ${data.name},`,
    '',
    `Thanks for reaching out about hosting an event at ${config.siteName}. We've received your details and we're reviewing them now.`,
    config.responseTime,
    '',
    `Your event: ${formatDate(data.eventDate)} · ${formatTimeRange(data.startTime, data.endTime)} · ${data.guestCount} guests`,
  ].join('\n');

  return { subject, html, text };
}
