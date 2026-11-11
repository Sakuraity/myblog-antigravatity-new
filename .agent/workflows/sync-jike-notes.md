---
description: Sync public Jike posts into Notes (add + unpublish)
---

# Sync Jike Notes Workflow

// turbo-all

Trigger this workflow for scheduled Jike → Notes sync, or when the user asks to "同步即刻" / "sync jike notes".

## Goal

Keep `src/content/notes/` aligned with the **public** posts on Kangyuan's Jike profile.

**Browse on mobile web** (desktop `web.okjike.com` often shows a login QR wall):

- Profile: `https://m.okjike.com/users/815916E7-5BD5-4EC6-9EB1-14458F0E11CE`
- Post detail: `https://m.okjike.com/originalPosts/<postId>`

Published notes still link to the desktop `web.okjike.com/.../post/<postId>` URL via the sync script (matches existing Notes).

Rules:

1. **Public posts** → sync into Notes as close to the original text as possible (light markdown formatting OK; do **not** rewrite meaning).
2. **Images** → download into the repo (do not leave only remote CDN links for newly synced notes).
3. **Private / only-me / deleted posts**:
   - If already synced → **delete** the corresponding note file (and local images).
   - If not synced yet → **do not** create a note.
4. **No human review**: commit and **push directly to `main`**. Do **not** open a pull request.
5. If nothing changed → make no commit.

## Steps

### 1. Inventory existing synced notes

```bash
node scripts/jike/list-synced.mjs
```

Treat every returned `postId` / `url` as a candidate that must still be publicly visible.

### 2. Verify visibility for each already-synced post

For each existing synced note `postId`, open the **mobile** detail URL:

`https://m.okjike.com/originalPosts/<postId>`

- Mark status:
  - `public` — post body is readable without login
  - `private_or_deleted` — login wall, 仅自己可见, 内容不存在/已删除, 404, or empty private placeholder
- Do **not** count a transient network error as deleted; retry once, then leave it untouched and report `unknown`.

Collect removals:

```json
{ "postId": "...", "reason": "private_or_deleted" }
```

### 3. Discover recent public posts (preferred: Playwright helper)

Prefer the deterministic fetcher (captures API JSON + absolute `createdAt`):

```bash
# requires: npx playwright install chromium  (once per environment)
node scripts/jike/fetch-public-posts.mjs --exclude-synced --limit 20 --out /tmp/jike-fetch.json
node scripts/jike/build-plan-from-fetch.mjs --from /tmp/jike-fetch.json --out /tmp/jike-sync-plan.json
```

Defaults already keep **owner original posts only** (skips other users / reposts).  
`createdAt` is converted from API UTC `Z` into Asia/Shanghai `+08:00` — never use the sync clock.

Manual browser fallback only if the helper fails: open mobile profile/detail, resolve absolute time from network JSON (`createdAt` / `actionTime`), never from UI labels like `06:53` / `2天前`.

### 4. Merge removals + apply

If step 2 found removals, merge them into `/tmp/jike-sync-plan.json` under `removals`.

Then:

```bash
node scripts/jike/apply-sync.mjs --plan /tmp/jike-sync-plan.json
```

The script will:

- delete removed notes + `public/notes/jike/<postId>/`
- create new markdown under `src/content/notes/`
- download images to `public/notes/jike/<postId>/`
- skip posts that already exist (idempotent)

### 5. Commit and push to main

If the script created/removed files:

```bash
git checkout main
git pull origin main
git add src/content/notes public/notes/jike
git status
git commit -m "sync(notes): update Jike public posts"
git push origin main
```

Do **not** open a PR.

If working tree is clean after apply → stop; say “no Jike changes”.

## Content constraints

- Preserve original Chinese text; only fix markdown spacing / line breaks.
- New notes frontmatter must include `jikePostId`.
- Keep tags `["Jike", "随想"]` unless the note already had different tags (removals only delete whole files; do not edit unrelated notes).
- Always append the standard “查看原文” link (script does this).

## Automation schedule (Asia/Shanghai)

- 12:00
- 18:00

Cron (UTC): `0 4,10 * * *`
