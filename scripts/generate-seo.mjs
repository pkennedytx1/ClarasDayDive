import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const site = JSON.parse(readFileSync(join(root, 'src/content/site.json'), 'utf8'));
const faq = JSON.parse(readFileSync(join(root, 'src/content/faq.json'), 'utf8'));
const drinks = JSON.parse(readFileSync(join(root, 'src/content/drinks.json'), 'utf8'));
const events = JSON.parse(readFileSync(join(root, 'src/content/events.json'), 'utf8'));
const legal = JSON.parse(readFileSync(join(root, 'src/content/legal.json'), 'utf8'));

const baseUrl = site.seo.siteUrl.replace(/\/$/, '');
const today = new Date().toISOString().slice(0, 10);

mkdirSync(join(root, 'public'), { recursive: true });

const legalUrls = legal.policies
  .map(
    (p) => `  <url>
    <loc>${baseUrl}${p.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.4</priority>
  </url>`,
  )
  .join('\n');

writeFileSync(
  join(root, 'public/sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
${legalUrls}
</urlset>
`,
);

writeFileSync(
  join(root, 'public/robots.txt'),
  `User-agent: *
Allow: /

User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: Claude-Web
Allow: /

User-agent: anthropic-ai
Allow: /

User-agent: Google-Extended
Allow: /

Sitemap: ${baseUrl}/sitemap.xml
`,
);

const legalSection = legal.policies.map((p) => `- [${p.title}](${baseUrl}${p.path})`).join('\n');

const llms = `# Clara's Day Dive

> East Austin coupe bar and patio — day drinks, spritzes, food trucks, and live events.

## Identity
- **Name:** ${site.name}
- **Type:** Coupe bar, cocktail bar, patio bar
- **Tagline:** ${site.tagline}
- **Neighborhood:** East Austin, Texas

## Location
- **Address:** ${site.location.address}, ${site.location.city}
- **Coordinates:** ${site.seo.geo.latitude}, ${site.seo.geo.longitude}

## Hours
${site.hours.map((h) => `- ${h}`).join('\n')}

## Contact
- **Events email:** ${site.contact.email}
- **Events phone:** ${site.contact.phone}
- **Instagram:** ${site.social.instagram}

## About
${site.seo.longDescription}

## Signature drinks
${drinks.items.map((d) => `- **${d.name}** (${d.price})${d.badge ? ` — ${d.badge}` : ''}: ${d.desc}`).join('\n')}

## Upcoming events
${events.items.map((e) => `- **${e.title}** (${e.month} ${e.day}): ${e.timeLabel}. ${e.desc}`).join('\n')}

## Frequently asked questions
${faq.items.map((f) => `### ${f.question}\n${f.answer}`).join('\n\n')}

## Legal policies
${legalSection}

## Canonical URL
${baseUrl}/
`;

writeFileSync(join(root, 'public/llms.txt'), llms);
console.log('Generated sitemap.xml, robots.txt, llms.txt');
