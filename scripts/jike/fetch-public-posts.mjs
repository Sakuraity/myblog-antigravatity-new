#!/usr/bin/env node
/**
 * Fetch recent public Jike posts via Playwright (mobile web).
 * Captures API/JSON payloads so we get absolute publish times.
 *
 * Usage:
 *   node scripts/jike/fetch-public-posts.mjs
 *   node scripts/jike/fetch-public-posts.mjs --limit 10
 *   node scripts/jike/fetch-public-posts.mjs --exclude-synced
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';
import {
  JIKE_INTERNAL_USER_ID,
  JIKE_MOBILE_PROFILE_URL,
  REPO_ROOT,
  listSyncedJikeNotes,
  toShanghaiIso,
} from './lib.mjs';

function argValue(argv, name, fallback = null) {
  const idx = argv.indexOf(name);
  if (idx === -1) return fallback;
  return argv[idx + 1] ?? fallback;
}

function asArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function collectPosts(node, bag = new Map()) {
  if (!node || typeof node !== 'object') return bag;

  const id = node.id || node.postId;
  const content = node.content || node.message || node.text;
  const createdAt =
    node.createdAt || node.actionTime || node.publishTime || node.time;

  const typeHint = String(node.type || node.topicType || node.postType || '');
  const looksLikePost =
    typeof id === 'string' &&
    id.length >= 16 &&
    typeof content === 'string' &&
    content.trim() &&
    createdAt &&
    !typeHint.toLowerCase().includes('comment');

  if (looksLikePost) {
    const pictures = [];
    for (const pic of asArray(node.pictures || node.images || node.media || [])) {
      if (typeof pic === 'string') pictures.push(pic);
      else if (pic?.picUrl) pictures.push(pic.picUrl);
      else if (pic?.middlePicUrl) pictures.push(pic.middlePicUrl);
      else if (pic?.smallPicUrl) pictures.push(pic.smallPicUrl);
      else if (pic?.url) pictures.push(pic.url);
    }

    const existing = bag.get(id) || {};
    bag.set(id, {
      postId: id,
      text: content,
      createdAtRaw: createdAt,
      images: pictures.length ? pictures : existing.images || [],
      type: typeHint || existing.type || null,
      userId:
        node.user?.id ||
        node.user?.username ||
        node.userId ||
        existing.userId ||
        null,
    });
  }

  if (Array.isArray(node)) {
    for (const item of node) collectPosts(item, bag);
  } else {
    for (const value of Object.values(node)) collectPosts(value, bag);
  }
  return bag;
}

function toPlus08(isoLike) {
  const date = new Date(isoLike);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid createdAt: ${isoLike}`);
  }
  return toShanghaiIso(date);
}

const argv = process.argv.slice(2);
const limit = Number(argValue(argv, '--limit', '8')) || 8;
const excludeSynced = argv.includes('--exclude-synced');
const ownerOnly = !argv.includes('--include-others');
const originalOnly = !argv.includes('--include-reposts');
const outPath = argValue(argv, '--out', '/tmp/jike-fetch.json');

const synced = new Set((await listSyncedJikeNotes()).map((n) => n.postId));
const captured = new Map();

const browser = await chromium.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
});
const page = await browser.newPage({
  userAgent:
    'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
  viewport: { width: 430, height: 900 },
});

page.on('response', async (response) => {
  try {
    const url = response.url();
    const type = response.headers()['content-type'] || '';
    if (!/json|javascript|text\/plain/i.test(type) && !/okjike|ruguoapp|jike/i.test(url)) {
      return;
    }
    if (response.status() >= 400) return;
    const text = await response.text();
    if (!text || text.length < 2) return;
    if (!(text.trim().startsWith('{') || text.trim().startsWith('['))) return;
    const data = JSON.parse(text);
    collectPosts(data, captured);
  } catch {
    // ignore non-JSON / aborted responses
  }
});

await page.goto(JIKE_MOBILE_PROFILE_URL, {
  waitUntil: 'networkidle',
  timeout: 60000,
});

// Scroll to load a few more posts / XHR pages.
for (let i = 0; i < 4; i += 1) {
  await page.mouse.wheel(0, 1800);
  await page.waitForTimeout(1200);
}

// Also parse hydrated __NEXT_DATA__ after client navigation/render.
try {
  const nextData = await page.evaluate(() => {
    const el = document.getElementById('__NEXT_DATA__');
    return el ? el.textContent : null;
  });
  if (nextData) collectPosts(JSON.parse(nextData), captured);
} catch {
  // ignore
}

await browser.close();

let posts = [...captured.values()]
  .map((post) => ({
    ...post,
    createdAt: toPlus08(post.createdAtRaw),
    alreadySynced: synced.has(post.postId),
  }))
  .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

if (ownerOnly) {
  posts = posts.filter(
    (post) => !post.userId || post.userId === JIKE_INTERNAL_USER_ID
  );
}
if (originalOnly) {
  posts = posts.filter((post) => {
    const type = String(post.type || '').toUpperCase();
    return !type || type === 'ORIGINAL_POST';
  });
}
if (excludeSynced) {
  posts = posts.filter((post) => !post.alreadySynced);
}

posts = posts.slice(0, limit);

const payload = {
  profile: JIKE_MOBILE_PROFILE_URL,
  fetchedAt: toShanghaiIso(new Date()),
  count: posts.length,
  posts,
};

await fs.writeFile(outPath, JSON.stringify(payload, null, 2));
process.stdout.write(`${JSON.stringify(payload, null, 2)}\n`);
if (outPath.startsWith('/tmp') || outPath.includes('tmp-jike')) {
  // also emit machine-friendly path
}
