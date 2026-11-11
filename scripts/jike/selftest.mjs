#!/usr/bin/env node
/**
 * Local self-test for Jike sync helpers (create → idempotent skip → remove).
 * Cleans up fixture artifacts before exit.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';
import {
  IMAGES_DIR,
  NOTES_DIR,
  REPO_ROOT,
  listSyncedJikeNotes,
} from './lib.mjs';

const FIXTURE_ID = 'fixture000000000000000001';
const PLAN_PATH = path.join(REPO_ROOT, 'scripts/jike/fixtures/sample-plan.json');

function runNode(args) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, args, {
      cwd: REPO_ROOT,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (chunk) => {
      stdout += chunk;
    });
    child.stderr.on('data', (chunk) => {
      stderr += chunk;
    });
    child.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Command failed (${code}): ${args.join(' ')}\n${stderr}\n${stdout}`));
        return;
      }
      resolve({ stdout, stderr });
    });
  });
}

async function cleanupFixture() {
  const notes = await listSyncedJikeNotes();
  for (const note of notes.filter((item) => item.postId === FIXTURE_ID)) {
    await fs.unlink(note.filePath).catch(() => {});
  }
  await fs.rm(path.join(IMAGES_DIR, FIXTURE_ID), { recursive: true, force: true });
}

await cleanupFixture();

const missingDatePlanPath = path.join(REPO_ROOT, 'scripts/jike/fixtures/missing-date-plan.json');
await fs.writeFile(
  missingDatePlanPath,
  JSON.stringify(
    {
      removals: [],
      upserts: [
        {
          postId: 'fixture-missing-date-should-fail',
          text: 'should fail without createdAt',
          images: [],
        },
      ],
    },
    null,
    2
  )
);
const missingDateResult = await runNode([
  'scripts/jike/apply-sync.mjs',
  '--plan',
  missingDatePlanPath,
]).then(
  () => ({ ok: true }),
  (error) => ({ ok: false, error })
);
await fs.unlink(missingDatePlanPath).catch(() => {});
if (missingDateResult.ok) {
  throw new Error('Expected apply-sync to reject upserts without createdAt');
}

const createResult = await runNode([
  'scripts/jike/apply-sync.mjs',
  '--plan',
  PLAN_PATH,
]);
const created = JSON.parse(createResult.stdout);
if (created.createdCount !== 1) {
  throw new Error(`Expected 1 created, got ${created.createdCount}: ${createResult.stdout}`);
}

const notePath = path.join(NOTES_DIR, created.created[0].fileName);
const noteRaw = await fs.readFile(notePath, 'utf8');
if (!noteRaw.includes(`jikePostId: ${FIXTURE_ID}`)) {
  throw new Error('Created note missing jikePostId');
}
if (!noteRaw.includes('date: 2026-03-11T12:00:00+08:00')) {
  throw new Error('Created note date must equal Jike publish time from plan, not sync time');
}
if (!created.created[0].fileName.startsWith('2026-03-11-')) {
  throw new Error(`Filename date must follow publish day, got ${created.created[0].fileName}`);
}
if (!noteRaw.includes('这是一条用于同步脚本自测的即刻原文')) {
  throw new Error('Created note missing original text');
}
if (!noteRaw.includes(`/notes/jike/${FIXTURE_ID}/`)) {
  throw new Error('Created note missing local image path');
}

const imageDir = path.join(IMAGES_DIR, FIXTURE_ID);
const images = await fs.readdir(imageDir);
if (images.length < 1) {
  throw new Error('Expected downloaded image files');
}

const skipResult = await runNode([
  'scripts/jike/apply-sync.mjs',
  '--plan',
  PLAN_PATH,
]);
const skipped = JSON.parse(skipResult.stdout);
if (skipped.createdCount !== 0 || skipped.skippedCount < 1) {
  throw new Error(`Expected idempotent skip, got: ${skipResult.stdout}`);
}

const removalPlan = {
  removals: [{ postId: FIXTURE_ID, reason: 'private_or_deleted' }],
  upserts: [],
};
const removalPath = path.join(REPO_ROOT, 'scripts/jike/fixtures/removal-plan.json');
await fs.writeFile(removalPath, JSON.stringify(removalPlan, null, 2));

const removeResult = await runNode([
  'scripts/jike/apply-sync.mjs',
  '--plan',
  removalPath,
]);
const removed = JSON.parse(removeResult.stdout);
if (removed.removedCount !== 1) {
  throw new Error(`Expected 1 removal, got: ${removeResult.stdout}`);
}

await fs.access(notePath).then(
  () => {
    throw new Error('Note file still exists after removal');
  },
  () => {}
);
await fs.access(imageDir).then(
  () => {
    throw new Error('Image dir still exists after removal');
  },
  () => {}
);

await fs.unlink(removalPath).catch(() => {});
await cleanupFixture();

const listed = JSON.parse((await runNode(['scripts/jike/list-synced.mjs'])).stdout);
if (!listed.count || !Array.isArray(listed.notes)) {
  throw new Error('list-synced output invalid');
}

console.log(
  JSON.stringify(
    {
      ok: true,
      checks: [
        'reject-missing-createdAt',
        'create',
        'publish-date-not-sync-date',
        'download-image',
        'idempotent-skip',
        'remove',
        'list-synced',
      ],
      existingJikeNotes: listed.count,
    },
    null,
    2
  )
);
