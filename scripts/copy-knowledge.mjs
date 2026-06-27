import { copyFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const source = join(root, 'src/content/knowledge.json');
const target = join(root, 'packages/ask-clara/knowledge.json');

copyFileSync(source, target);
console.log(`Copied ${source} → ${target}`);
