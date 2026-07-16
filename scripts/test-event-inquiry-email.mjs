#!/usr/bin/env node
/**
 * Wrapper — runs the TypeScript test script via tsx.
 * See scripts/test-event-inquiry-email.ts for usage.
 */
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const script = join(root, 'scripts/test-event-inquiry-email.ts');
const tsxBin = join(root, 'node_modules/.bin/tsx');

const result = spawnSync(tsxBin, [script, ...process.argv.slice(2)], {
  stdio: 'inherit',
  cwd: root,
});

process.exit(result.status ?? 1);
