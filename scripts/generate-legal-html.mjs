import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildLegalPageJsonLd } from './lib/build-json-ld.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderSections(sections) {
  return sections
    .map((section) => {
      const paragraphs = (section.paragraphs ?? [])
        .map((p) => `<p>${escapeHtml(p)}</p>`)
        .join('\n');
      const list = section.list
        ? `<ul>${section.list.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`
        : '';
      return `<section><h2>${escapeHtml(section.heading)}</h2>${paragraphs}${list}</section>`;
    })
    .join('\n');
}

function renderLegalPage(site, policy) {
  const baseUrl = site.seo.siteUrl.replace(/\/$/, '');
  const canonical = `${baseUrl}${policy.path}`;
  const jsonLd = buildLegalPageJsonLd(site, policy);
  const formattedDate = new Date(policy.lastUpdated).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(policy.title)} — ${escapeHtml(site.name)}</title>
  <meta name="description" content="${escapeHtml(policy.metaDescription)}" />
  <meta name="robots" content="index, follow" />
  <link rel="canonical" href="${canonical}" />
  <meta property="og:type" content="website" />
  <meta property="og:title" content="${escapeHtml(policy.title)} — ${escapeHtml(site.name)}" />
  <meta property="og:description" content="${escapeHtml(policy.metaDescription)}" />
  <meta property="og:url" content="${canonical}" />
  <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
  <style>
    body { margin: 0; font-family: system-ui, sans-serif; line-height: 1.6; color: #1a1a1a; background: #faf7f0; }
    main { max-width: 42rem; margin: 0 auto; padding: 2rem 1.25rem 4rem; }
    a { color: #0d6b6e; }
    h1 { font-size: 2rem; margin: 0 0 0.5rem; }
    h2 { font-size: 1.25rem; margin: 2rem 0 0.75rem; }
    p, ul { margin: 0 0 1rem; }
    .meta { color: #555; font-size: 0.9rem; }
  </style>
</head>
<body>
  <main>
    <h1>${escapeHtml(policy.title)}</h1>
    <p class="meta">Last updated ${formattedDate}</p>
    ${renderSections(policy.sections)}
    <p><a href="${baseUrl}/">← Back to ${escapeHtml(site.name)}</a></p>
  </main>
</body>
</html>`;
}

export function generateLegalHtml(site, legal, outDir = join(root, 'public')) {
  for (const policy of legal.policies) {
    const dir = join(outDir, policy.path.slice(1));
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, 'index.html'), renderLegalPage(site, policy));
  }
}
