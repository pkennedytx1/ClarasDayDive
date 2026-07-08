import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { filterUpcomingEvents } from './lib/filter-upcoming-events.mjs';
import { buildJsonLd } from './lib/build-json-ld.mjs';
import { generateLegalHtml } from './generate-legal-html.mjs';
import { SITEMAP_SECTION_PATHS } from './lib/sections.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const site = JSON.parse(readFileSync(join(root, 'src/content/site.json'), 'utf8'));
const faq = JSON.parse(readFileSync(join(root, 'src/content/faq.json'), 'utf8'));
const drinks = JSON.parse(readFileSync(join(root, 'src/content/drinks.json'), 'utf8'));
const eventsRaw = JSON.parse(readFileSync(join(root, 'src/content/events.json'), 'utf8'));
const events = { ...eventsRaw, items: filterUpcomingEvents(eventsRaw.items) };
const legal = JSON.parse(readFileSync(join(root, 'src/content/legal.json'), 'utf8'));

let knowledgeChunks = [];
const knowledgePath = join(root, 'src/content/knowledge.json');
if (existsSync(knowledgePath)) {
  knowledgeChunks = JSON.parse(readFileSync(knowledgePath, 'utf8')).chunks ?? [];
}

const baseUrl = site.seo.siteUrl.replace(/\/$/, '');
const today = new Date().toISOString().slice(0, 10);
const ogImagePath = site.seo.ogImage ?? '/assets/scarf.jpg';
const ogImageUrl = ogImagePath.startsWith('http') ? ogImagePath : `${baseUrl}${ogImagePath}`;

function socialLines(social) {
  const rows = [
    ['Instagram', social.instagram],
    ['Facebook', social.facebook],
    ['TikTok', social.tiktok],
  ].filter(([, url]) => url?.trim());
  return rows.length
    ? rows.map(([label, url]) => `- **${label}:** ${url}`).join('\n')
    : '- Social links: add URLs in the Google Sheet _Settings tab.';
}

mkdirSync(join(root, 'public'), { recursive: true });

const gallery = existsSync(join(root, 'src/content/gallery.json'))
  ? JSON.parse(readFileSync(join(root, 'src/content/gallery.json'), 'utf8'))
  : { items: [] };

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

const sectionPaths = SITEMAP_SECTION_PATHS.filter(
  (path) => path !== '/gallery' || gallery.items?.length > 0,
);
const sectionUrls = sectionPaths
  .map(
    (path) => `  <url>
    <loc>${baseUrl}${path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
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
${sectionUrls}
${legalUrls}
</urlset>
`,
);

writeFileSync(
  join(root, 'public/robots.txt'),
  `# LLMs: ${baseUrl}/llms.txt
# Knowledge: ${baseUrl}/knowledge.txt

User-agent: *
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

User-agent: PerplexityBot
Allow: /

User-agent: Applebot-Extended
Allow: /

Sitemap: ${baseUrl}/sitemap.xml
`,
);

const legalSection = legal.policies.map((p) => `- [${p.title}](${baseUrl}${p.path})`).join('\n');
const venueFacts = knowledgeChunks
  .filter((c) => c.type === 'knowledge')
  .map((c) => `- **${c.id.replace(/^knowledge-/, '').replace(/-/g, ' ')}:** ${c.text}`)
  .join('\n');

const llms = `# Clara's Day Dive

> East Austin coupe bar and patio — day drinks, spritzes, food trucks, and live events.

## Identity
- **Name:** ${site.name}
- **Type:** Coupe bar, cocktail bar, patio bar
- **Tagline:** ${site.tagline}
- **Neighborhood:** East Austin, Texas
- **Age policy:** 21+ with valid ID

## Location
- **Address:** ${site.location.address}, ${site.location.city}
- **Coordinates:** ${site.seo.geo.latitude}, ${site.seo.geo.longitude}
- **Directions:** ${site.mapsUrl}
- **Dog-friendly patio:** Yes

## Hours
${site.hours.map((h) => `- ${h}`).join('\n')}

## Contact
- **Events email:** ${site.contact.email}
- **Events phone:** ${site.contact.phone}
${socialLines(site.social)}
- **Book private events:** ${baseUrl}/contact

## About
${site.seo.longDescription}

## Signature drinks
${drinks.items.map((d) => `- **${d.name}** (${d.price})${d.badge ? ` — ${d.badge}` : ''}: ${d.desc}`).join('\n')}

## Upcoming events
${events.items.length ? events.items.map((e) => `- **${e.title}** (${e.month} ${e.day}): ${e.timeLabel}. ${e.desc}`).join('\n') : '- No upcoming public events listed. Check the website for updates.'}

## Venue facts
${venueFacts || '- See FAQ below for parking, food trucks, and patio details.'}

## Frequently asked questions
${faq.items.map((f) => `### ${f.question}\n${f.answer}`).join('\n\n')}

## Ask Clara
- On-site AI assistant for drink suggestions and venue questions: ${baseUrl}/ask-clara
- Answers are generated from our menu and venue information; confirm details with staff.

## Legal policies
${legalSection}

## Canonical URL
${baseUrl}/
`;

writeFileSync(join(root, 'public/llms.txt'), llms);

const knowledgeTxt = `# Clara's Day Dive — venue knowledge

Canonical site: ${baseUrl}/

## Location & visit
- Address: ${site.location.address}, ${site.location.city}
- Maps: ${site.mapsUrl}
- Hours: ${site.hours.join('; ')}
- Dog-friendly shaded patio

## Contact
- Email: ${site.contact.email}
- Phone: ${site.contact.phone}
- Private events: ${baseUrl}/contact

${venueFacts ? `## Facts\n${venueFacts}\n` : ''}
## Menu highlights
${drinks.items.map((d) => `- ${d.name} (${d.price}): ${d.desc}`).join('\n')}

## Events
${events.items.length ? events.items.map((e) => `- ${e.title} — ${e.month} ${e.day}, ${e.timeLabel}. ${e.desc}`).join('\n') : '- No upcoming events at this time.'}

## FAQ
${faq.items.map((f) => `Q: ${f.question}\nA: ${f.answer}`).join('\n\n')}
`;

writeFileSync(join(root, 'public/knowledge.txt'), knowledgeTxt);

const jsonLdScripts = buildJsonLd({ site, drinks, faq, events })
  .map(
    (schema, i) =>
      `    <script type="application/ld+json" data-seo-schema="${i}">${JSON.stringify(schema)}</script>`,
  )
  .join('\n');

const indexPath = join(root, 'index.html');
let indexHtml = readFileSync(indexPath, 'utf8');

indexHtml = indexHtml.replace(
  /\s*<script type="application\/ld\+json" data-seo-schema="\d+">[\s\S]*?<\/script>/g,
  '',
);

indexHtml = indexHtml.replace(/<link rel="canonical" href="[^"]*" \/>/, `<link rel="canonical" href="${baseUrl}/" />`);
indexHtml = indexHtml.replace(
  /<meta property="og:url" content="[^"]*" \/>/,
  `<meta property="og:url" content="${baseUrl}/" />`,
);
indexHtml = indexHtml.replace(
  /<meta property="og:image" content="[^"]*" \/>/,
  `<meta property="og:image" content="${ogImageUrl}" />`,
);
indexHtml = indexHtml.replace(
  /<meta name="twitter:image" content="[^"]*" \/>/,
  `<meta name="twitter:image" content="${ogImageUrl}" />`,
);

const gscVerification = site.seo.googleSiteVerification?.trim() ?? '';
indexHtml = indexHtml.replace(/\s*<meta name="google-site-verification" content="[^"]*" \/>/g, '');
if (gscVerification) {
  const gscMeta = `    <meta name="google-site-verification" content="${gscVerification.replace(/"/g, '&quot;')}" />`;
  indexHtml = indexHtml.replace(/<meta name="theme-color"/, `${gscMeta}\n    <meta name="theme-color"`);
}

const twitterBlock = `    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${site.seo.title.replace(/"/g, '&quot;')}" />
    <meta name="twitter:description" content="${site.seo.description.replace(/"/g, '&quot;')}" />
    <meta name="twitter:image" content="${ogImageUrl}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="${site.name} — East Austin coupe bar and patio" />`;

if (!indexHtml.includes('twitter:title')) {
  indexHtml = indexHtml.replace(
    /<meta name="twitter:card" content="summary_large_image" \/>/,
    twitterBlock,
  );
}

if (indexHtml.includes('<!-- INJECT_JSON_LD -->')) {
  indexHtml = indexHtml.replace('<!-- INJECT_JSON_LD -->', jsonLdScripts);
} else {
  indexHtml = indexHtml.replace('</head>', `${jsonLdScripts}\n  </head>`);
}

writeFileSync(indexPath, indexHtml);

generateLegalHtml(site, legal);

console.log('Generated sitemap.xml, robots.txt, llms.txt, knowledge.txt, legal HTML, index.html SEO');
