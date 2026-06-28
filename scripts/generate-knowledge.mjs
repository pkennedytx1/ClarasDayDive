import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const contentDir = join(root, 'src/content');

const STOP_WORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'for', 'with', 'on', 'at', 'to', 'in', 'is', 'are',
  'our', 'we', 'you', 'your', 'this', 'that', 'from', 'all', 'any', 'can', 'has', 'have',
]);

function slugify(str) {
  return str
    .toLowerCase()
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function extractKeywords(...texts) {
  const words =
    texts
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
      .match(/[a-z0-9']+/g) ?? [];
  return [...new Set(words.filter((w) => w.length > 2 && !STOP_WORDS.has(w)))];
}

function parseKeywordList(raw) {
  if (!raw) return [];
  return String(raw)
    .split(',')
    .map((k) => k.trim().toLowerCase())
    .filter(Boolean);
}

function readJson(name) {
  const path = join(contentDir, name);
  if (!existsSync(path)) return null;
  return JSON.parse(readFileSync(path, 'utf8'));
}

/**
 * Build RAG knowledge chunks from synced content JSON files.
 * @param {string} [dir] - Content directory (defaults to src/content)
 * @returns {{ chunks: Array<{ id: string; type: string; text: string; keywords: string[] }> }}
 */
export function generateKnowledge(dir = contentDir) {
  const site = JSON.parse(readFileSync(join(dir, 'site.json'), 'utf8'));
  const drinks = JSON.parse(readFileSync(join(dir, 'drinks.json'), 'utf8'));
  const events = JSON.parse(readFileSync(join(dir, 'events.json'), 'utf8'));
  const whatsHere = JSON.parse(readFileSync(join(dir, 'whats-here.json'), 'utf8'));
  const faq = JSON.parse(readFileSync(join(dir, 'faq.json'), 'utf8'));

  const chunks = [];

  chunks.push({
    id: 'settings-about',
    type: 'settings',
    text: `${site.name} — ${site.tagline} ${site.description}`,
    keywords: extractKeywords(site.name, site.tagline, site.description, 'about', 'bar', 'patio'),
  });

  chunks.push({
    id: 'settings-location',
    type: 'settings',
    text: `Location: ${site.location.eyebrow}. Address: ${site.location.address}, ${site.location.city}.`,
    keywords: extractKeywords(
      site.location.address,
      site.location.city,
      site.location.eyebrow,
      'location',
      'address',
      'visit',
      'directions',
    ),
  });

  chunks.push({
    id: 'settings-contact',
    type: 'settings',
    text: `Contact ${site.contact.coordinatorName} (${site.contact.coordinatorRole}). Email: ${site.contact.email}. Phone: ${site.contact.phone}. ${site.contact.responseTime}`,
    keywords: extractKeywords(
      site.contact.email,
      site.contact.phone,
      site.contact.coordinatorName,
      'contact',
      'book',
      'event',
      'private',
      'booking',
    ),
  });

  if (site.hours?.length) {
    chunks.push({
      id: 'hours-summary',
      type: 'hours',
      text: `Hours: ${site.hours.join('; ')}.`,
      keywords: extractKeywords(...site.hours, 'hours', 'open', 'close', 'when'),
    });
  }

  for (const row of site.hoursStructured ?? []) {
    const days = row.days.join(', ');
    chunks.push({
      id: `hours-${slugify(days)}`,
      type: 'hours',
      text: `${days}: opens ${row.opens}, closes ${row.closes}.`,
      keywords: extractKeywords(days, row.opens, row.closes, 'hours', 'open'),
    });
  }

  for (const item of drinks.items) {
    const badgePart = item.badge ? `${item.badge} badge. ` : '';
    chunks.push({
      id: `drink-${slugify(item.name)}`,
      type: 'drink',
      text: `${item.name} (${item.cat}) — ${item.price}. ${badgePart}${item.desc}`,
      keywords: extractKeywords(item.name, item.cat, item.desc, item.badge, 'drink', 'menu', 'cocktail'),
    });
  }

  for (const item of faq.items) {
    chunks.push({
      id: `faq-${slugify(item.question)}`,
      type: 'faq',
      text: `Q: ${item.question} A: ${item.answer}`,
      keywords: extractKeywords(item.question, item.answer, 'faq'),
    });
  }

  for (const item of events.items) {
    const ticketPart = item.ticketUrl ? ` Tickets: ${item.ticketUrl}.` : '';
    chunks.push({
      id: `event-${slugify(item.title)}`,
      type: 'event',
      text: `${item.title} (${item.tag}) — ${item.month} ${item.day}, ${item.timeLabel}. ${item.desc}${ticketPart}`,
      keywords: extractKeywords(item.title, item.tag, item.desc, item.timeLabel, 'event', 'calendar'),
    });
  }

  for (const item of whatsHere.items) {
    const hoursPart = item.hours ? ` Hours: ${item.hours}.` : '';
    const linksPart = [item.websiteUrl && `Website: ${item.websiteUrl}`, item.orderUrl && `Order: ${item.orderUrl}`]
      .filter(Boolean)
      .join(' ');
    chunks.push({
      id: `here-${slugify(item.title)}`,
      type: 'here',
      text: `${item.title} (${item.tag}): ${item.body}${hoursPart}${linksPart ? ` ${linksPart}` : ''}`,
      keywords: extractKeywords(item.title, item.tag, item.body, item.hours, item.icon, 'patio', 'food', 'coffee', 'truck'),
    });
  }

  const suggestions = site.search?.suggestions ?? [];
  const responses = site.search?.responses ?? {};
  for (const suggestion of suggestions) {
    const response = responses[suggestion];
    if (response) {
      chunks.push({
        id: `ask-${slugify(suggestion)}`,
        type: 'search',
        text: `Suggestion: ${suggestion}. Response: ${response}`,
        keywords: extractKeywords(suggestion, response, 'clara', 'recommend', 'order'),
      });
    }
  }

  const claraKnowledge = readJson('clara-knowledge.json');
  for (const item of claraKnowledge?.items ?? []) {
    const extra = parseKeywordList(item.keywords);
    chunks.push({
      id: `knowledge-${slugify(item.topic)}`,
      type: 'knowledge',
      text: `${item.topic}: ${item.fact}`,
      keywords: [...new Set([...extractKeywords(item.topic, item.fact, ...extra), ...extra])],
    });
  }

  return { chunks };
}

export function writeKnowledge(dir = contentDir, outPath = join(contentDir, 'knowledge.json')) {
  const knowledge = generateKnowledge(dir);
  writeFileSync(outPath, `${JSON.stringify(knowledge, null, 2)}\n`);
  return knowledge;
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) {
  const knowledge = writeKnowledge();
  console.log(`Generated src/content/knowledge.json (${knowledge.chunks.length} chunks)`);
}
