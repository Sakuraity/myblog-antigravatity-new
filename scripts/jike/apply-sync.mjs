#!/usr/bin/env node
/**
 * Apply a Jike → Notes sync plan.
 *
 * Input JSON shape:
 * {
 *   "upserts": [
 *     {
 *       "postId": "abc123",
 *       "createdAt": "2026-03-11T12:00:00+08:00",
 *       "text": "原文...",
 *       "images": ["https://..."],
 *       "slugHint": "optional-english-slug"
 *     }
 *   ],
 *   "removals": [
 *     { "postId": "def456", "reason": "private_or_deleted" }
 *   ]
 * }
 *
 * Usage:
 *   node scripts/jike/apply-sync.mjs --plan /tmp/jike-plan.json
 *   cat plan.json | node scripts/jike/apply-sync.mjs --stdin
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import {
  IMAGES_DIR,
  NOTES_DIR,
  dateParts,
  downloadImage,
  extensionFromUrl,
  listSyncedJikeNotes,
  removeDirIfExists,
  renderNoteMarkdown,
  slugify,
} from './lib.mjs';

function printHelp() {
  console.log(`Usage:
  node scripts/jike/apply-sync.mjs --plan <file.json>
  node scripts/jike/apply-sync.mjs --stdin

Plan JSON:
  {
    "upserts": [{ "postId", "createdAt", "text", "images": [], "slugHint"? }],
    "removals": [{ "postId", "reason"? }]
  }`);
}

async function readPlan(argv) {
  if (argv.includes('--help') || argv.includes('-h')) {
    printHelp();
    process.exit(0);
  }

  if (argv.includes('--stdin')) {
    const chunks = [];
    for await (const chunk of process.stdin) chunks.push(chunk);
    return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');
  }

  const planIdx = argv.indexOf('--plan');
  if (planIdx !== -1) {
    const planPath = argv[planIdx + 1];
    if (!planPath) throw new Error('--plan requires a file path');
    const raw = await fs.readFile(planPath, 'utf8');
    return JSON.parse(raw);
  }

  throw new Error('Provide --plan <file.json> or --stdin');
}

async function ensureUniqueFileName(baseName) {
  let candidate = baseName;
  let i = 2;
  while (true) {
    try {
      await fs.access(path.join(NOTES_DIR, candidate));
      const stem = baseName.replace(/\.md$/, '');
      candidate = `${stem}-${i}.md`;
      i += 1;
    } catch {
      return candidate;
    }
  }
}

async function removeNote(note, reason) {
  await fs.unlink(note.filePath);
  await removeDirIfExists(path.join(IMAGES_DIR, note.postId));
  return {
    action: 'removed',
    postId: note.postId,
    fileName: note.fileName,
    reason: reason || 'private_or_deleted',
  };
}

async function createNote(post, existingById) {
  const postId = post.postId;
  if (!postId) throw new Error('upsert missing postId');
  if (existingById.has(postId)) {
    return {
      action: 'skipped_exists',
      postId,
      fileName: existingById.get(postId).fileName,
    };
  }

  const createdAt = post.createdAt || new Date().toISOString();
  const { ymd, isoWithOffset } = dateParts(createdAt);
  const slugHint = slugify(post.slugHint || '', postId.slice(0, 8));
  const fileName = await ensureUniqueFileName(`${ymd}-${slugHint}.md`);

  const imageUrls = Array.isArray(post.images) ? post.images.filter(Boolean) : [];
  const imageMarkdownLines = [];

  if (imageUrls.length) {
    const dir = path.join(IMAGES_DIR, postId);
    await fs.mkdir(dir, { recursive: true });

    for (let i = 0; i < imageUrls.length; i += 1) {
      const url = imageUrls[i];
      const index = String(i + 1).padStart(2, '0');
      const tentativeExt = extensionFromUrl(url);
      const dest = path.join(dir, `${index}${tentativeExt}`);
      const savedPath = await downloadImage(url, dest);
      const publicPath = `/notes/jike/${postId}/${path.basename(savedPath)}`;
      imageMarkdownLines.push(`![image](${publicPath})`);
    }
  }

  const markdown = renderNoteMarkdown({
    postId,
    dateIso: isoWithOffset,
    text: post.text || '',
    imageMarkdownLines,
  });

  const filePath = path.join(NOTES_DIR, fileName);
  await fs.writeFile(filePath, markdown, 'utf8');

  return {
    action: 'created',
    postId,
    fileName,
    images: imageMarkdownLines.length,
  };
}

const plan = await readPlan(process.argv.slice(2));
const upserts = Array.isArray(plan.upserts) ? plan.upserts : [];
const removals = Array.isArray(plan.removals) ? plan.removals : [];

const existing = await listSyncedJikeNotes();
const existingById = new Map(existing.map((note) => [note.postId, note]));

const results = {
  created: [],
  removed: [],
  skipped: [],
  errors: [],
};

for (const removal of removals) {
  const postId = removal.postId;
  if (!postId) {
    results.errors.push({ action: 'remove', error: 'missing postId' });
    continue;
  }
  const note = existingById.get(postId);
  if (!note) {
    results.skipped.push({
      action: 'remove_missing',
      postId,
      reason: removal.reason || 'private_or_deleted',
    });
    continue;
  }
  try {
    const removed = await removeNote(note, removal.reason);
    results.removed.push(removed);
    existingById.delete(postId);
  } catch (error) {
    results.errors.push({
      action: 'remove',
      postId,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

for (const post of upserts) {
  try {
    const outcome = await createNote(post, existingById);
    if (outcome.action === 'created') {
      results.created.push(outcome);
      existingById.set(outcome.postId, {
        fileName: outcome.fileName,
        postId: outcome.postId,
      });
    } else {
      results.skipped.push(outcome);
    }
  } catch (error) {
    results.errors.push({
      action: 'upsert',
      postId: post.postId,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

const summary = {
  ok: results.errors.length === 0,
  createdCount: results.created.length,
  removedCount: results.removed.length,
  skippedCount: results.skipped.length,
  errorCount: results.errors.length,
  ...results,
};

process.stdout.write(`${JSON.stringify(summary, null, 2)}\n`);
if (!summary.ok) process.exitCode = 1;
