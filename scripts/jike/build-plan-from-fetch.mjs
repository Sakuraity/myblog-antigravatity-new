#!/usr/bin/env node
/**
 * Convert fetch-public-posts JSON into an apply-sync plan.
 *
 * Usage:
 *   node scripts/jike/build-plan-from-fetch.mjs --from /tmp/jike-fetch.json --out /tmp/jike-sync-plan.json
 */
import fs from 'node:fs/promises';

function argValue(argv, name) {
  const idx = argv.indexOf(name);
  if (idx === -1) return null;
  return argv[idx + 1] ?? null;
}

function slugHintFromText(text = '') {
  const firstLine = String(text).split('\n').map((s) => s.trim()).find(Boolean) || 'jike-note';
  const ascii = firstLine
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 40);
  return ascii || 'jike-note';
}

const argv = process.argv.slice(2);
const fromPath = argValue(argv, '--from');
const outPath = argValue(argv, '--out') || '/tmp/jike-sync-plan.json';
if (!fromPath) {
  throw new Error('Usage: node scripts/jike/build-plan-from-fetch.mjs --from <fetch.json> [--out plan.json]');
}

const fetched = JSON.parse(await fs.readFile(fromPath, 'utf8'));
const posts = Array.isArray(fetched.posts) ? fetched.posts : [];

const plan = {
  removals: Array.isArray(fetched.removals) ? fetched.removals : [],
  upserts: posts.map((post) => ({
    postId: post.postId,
    createdAt: post.createdAt,
    text: post.text,
    images: post.images || [],
    slugHint: post.slugHint || slugHintFromText(post.text),
  })),
};

await fs.writeFile(outPath, JSON.stringify(plan, null, 2));
process.stdout.write(`${JSON.stringify({ outPath, upserts: plan.upserts.length, removals: plan.removals.length }, null, 2)}\n`);
