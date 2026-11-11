#!/usr/bin/env node
/**
 * List existing Notes that originated from Jike.
 * Usage: node scripts/jike/list-synced.mjs
 */
import { listSyncedJikeNotes } from './lib.mjs';

const notes = await listSyncedJikeNotes();
const payload = {
  count: notes.length,
  notes: notes.map(({ fileName, postId, date, url }) => ({
    fileName,
    postId,
    date,
    url,
  })),
};

process.stdout.write(`${JSON.stringify(payload, null, 2)}\n`);
