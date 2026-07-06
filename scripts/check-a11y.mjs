import { readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

function checkHtml(path, rules) {
  if (!existsSync(path)) {
    console.error(`Missing: ${path}`);
    return false;
  }
  const html = readFileSync(path, 'utf8');
  let ok = true;
  for (const [label, test] of rules) {
    if (!test(html)) {
      console.error(`  ✗ ${path}: ${label}`);
      ok = false;
    }
  }
  if (ok) console.log(`  ✓ ${path}`);
  return ok;
}

let passed = true;

passed &&= checkHtml(join(root, 'index.html'), [
  ['lang attribute', (h) => /<html[^>]+lang="en"/.test(h)],
  ['viewport meta', (h) => /name="viewport"/.test(h)],
  ['canonical link', (h) => /rel="canonical"/.test(h)],
  ['JSON-LD scripts', (h) => /application\/ld\+json/.test(h)],
]);

const legal = JSON.parse(readFileSync(join(root, 'src/content/legal.json'), 'utf8'));
for (const policy of legal.policies) {
  const snapshot = join(root, 'public', policy.path.slice(1), 'index.html');
  passed &&= checkHtml(snapshot, [
    ['lang attribute', (h) => /<html[^>]+lang="en"/.test(h)],
    ['single h1', (h) => (h.match(/<h1/g) ?? []).length === 1],
    ['canonical link', (h) => /rel="canonical"/.test(h)],
    ['meta description', (h) => /name="description"/.test(h)],
  ]);
}

if (!passed) {
  console.error('\nAccessibility HTML checks failed.');
  process.exit(1);
}

console.log('\nAccessibility HTML checks passed.');
