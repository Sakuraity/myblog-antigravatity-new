import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const JIKE_USER_ID = '815916E7-5BD5-4EC6-9EB1-14458F0E11CE';
// Internal user id observed in mobile API payloads (distinct from profile UUID slug).
export const JIKE_INTERNAL_USER_ID = '67964ba52cfadd5e5180c609';
// web.okjike.com often shows a login wall; public scraping should use mobile web.
export const JIKE_PROFILE_URL = `https://web.okjike.com/u/${JIKE_USER_ID}`;
export const JIKE_MOBILE_PROFILE_URL = `https://m.okjike.com/users/${JIKE_USER_ID}`;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const REPO_ROOT = path.resolve(__dirname, '../..');
export const NOTES_DIR = path.join(REPO_ROOT, 'src/content/notes');
export const IMAGES_DIR = path.join(REPO_ROOT, 'public/notes/jike');

export const ORIGINAL_LINK_CLASSES =
  'inline-flex items-center gap-1.5 px-3 py-1.5 mt-1 text-xs font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-zinc-800 rounded-full hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors no-underline group-hover:bg-gray-200 dark:group-hover:bg-zinc-700';

export const EXTERNAL_LINK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-external-link"><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>`;

const POST_ID_RE = /okjike\.com\/u\/[^/]+\/post\/([a-f0-9]+)/i;
const FRONTMATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;

export function extractPostId(text = '') {
  const match = String(text).match(POST_ID_RE);
  return match?.[1] ?? null;
}

export function postUrl(postId) {
  // Keep desktop URLs in published notes for consistency with existing content.
  return `${JIKE_PROFILE_URL}/post/${postId}`;
}

export function mobilePostUrl(postId) {
  return `https://m.okjike.com/originalPosts/${postId}`;
}

export function parseFrontmatter(raw) {
  const match = raw.match(FRONTMATTER_RE);
  if (!match) {
    return { attributes: {}, body: raw, hasFrontmatter: false };
  }

  const attributes = {};
  for (const line of match[1].split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf(':');
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    let value = trimmed.slice(idx + 1).trim();
    if (value.startsWith('[') && value.endsWith(']')) {
      try {
        value = JSON.parse(value.replace(/'/g, '"'));
      } catch {
        value = value
          .slice(1, -1)
          .split(',')
          .map((part) => part.trim().replace(/^["']|["']$/g, ''))
          .filter(Boolean);
      }
    } else {
      value = value.replace(/^["']|["']$/g, '');
    }
    attributes[key] = value;
  }

  return {
    attributes,
    body: raw.slice(match[0].length),
    hasFrontmatter: true,
  };
}

export async function listNoteFiles() {
  const entries = await fs.readdir(NOTES_DIR);
  return entries
    .filter((name) => name.endsWith('.md'))
    .map((name) => path.join(NOTES_DIR, name))
    .sort();
}

export async function listSyncedJikeNotes() {
  const files = await listNoteFiles();
  const notes = [];

  for (const filePath of files) {
    const raw = await fs.readFile(filePath, 'utf8');
    const { attributes, body } = parseFrontmatter(raw);
    const postId =
      attributes.jikePostId ||
      extractPostId(body) ||
      extractPostId(raw);

    if (!postId) continue;

    notes.push({
      filePath,
      fileName: path.basename(filePath),
      postId,
      date: attributes.date ?? null,
      tags: attributes.tags ?? [],
      url: postUrl(postId),
    });
  }

  return notes;
}

export function slugify(input, fallback = 'note') {
  const ascii = String(input || '')
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  return ascii || fallback;
}

/**
 * Parse a Jike publish timestamp into Asia/Shanghai calendar parts.
 * Accepts ISO strings. Rejects empty values so callers cannot silently
 * substitute the sync clock.
 */
export function dateParts(isoLike) {
  if (isoLike == null || String(isoLike).trim() === '') {
    throw new Error('createdAt is required (use Jike publish time, not sync time)');
  }
  const date = new Date(isoLike);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid date: ${isoLike}`);
  }

  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const parts = Object.fromEntries(
    formatter.formatToParts(date).map(({ type, value }) => [type, value])
  );

  return {
    ymd: `${parts.year}-${parts.month}-${parts.day}`,
    isoWithOffset: toShanghaiIso(date),
  };
}

export function toShanghaiIso(date = new Date()) {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
  const parts = Object.fromEntries(
    formatter.formatToParts(date).map(({ type, value }) => [type, value])
  );
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}:${parts.second}+08:00`;
}

export function buildOriginalLinkHtml(url) {
  return `<a href="${url}" target="_blank" class="${ORIGINAL_LINK_CLASSES}">
  <span>查看原文</span>
  ${EXTERNAL_LINK_SVG}
</a>`;
}

export function normalizePostText(text = '') {
  return String(text)
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function extensionFromUrl(url, contentType = '') {
  const clean = String(url).split('?')[0];
  const fromPath = path.extname(clean).toLowerCase();
  if (fromPath && fromPath.length <= 5) return fromPath;

  if (contentType.includes('png')) return '.png';
  if (contentType.includes('webp')) return '.webp';
  if (contentType.includes('gif')) return '.gif';
  if (contentType.includes('jpeg') || contentType.includes('jpg')) return '.jpg';
  return '.jpg';
}

export function cleanImageUrl(url) {
  try {
    const parsed = new URL(url);
    // Keep original asset; drop imageMogr2 transforms when downloading.
    if (parsed.searchParams.has('imageMogr2') || parsed.search.includes('imageMogr2')) {
      parsed.search = '';
    }
    return parsed.toString();
  } catch {
    return url;
  }
}

export async function downloadImage(url, destPath) {
  const cleaned = cleanImageUrl(url);
  const response = await fetch(cleaned, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (compatible; KangyuanBlogJikeSync/1.0; +https://github.com/Sakuraity/myblog-antigravatity-new)',
      Referer: 'https://web.okjike.com/',
      Accept: 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to download image ${cleaned}: ${response.status}`);
  }

  const contentType = response.headers.get('content-type') || '';
  let finalPath = destPath;
  const ext = path.extname(destPath);
  if (!ext) {
    finalPath = `${destPath}${extensionFromUrl(cleaned, contentType)}`;
  }

  await fs.mkdir(path.dirname(finalPath), { recursive: true });
  const buffer = Buffer.from(await response.arrayBuffer());
  await fs.writeFile(finalPath, buffer);
  return finalPath;
}

export async function removeDirIfExists(dirPath) {
  await fs.rm(dirPath, { recursive: true, force: true });
}

export function renderNoteMarkdown({
  postId,
  dateIso,
  text,
  imageMarkdownLines = [],
  tags = ['Jike', '随想'],
}) {
  const bodyParts = [];
  const normalized = normalizePostText(text);
  if (normalized) bodyParts.push(normalized);
  if (imageMarkdownLines.length) {
    if (bodyParts.length) bodyParts.push('');
    bodyParts.push(imageMarkdownLines.join('\n'));
  }
  bodyParts.push('');
  bodyParts.push(buildOriginalLinkHtml(postUrl(postId)));

  const tagLiteral = JSON.stringify(tags);
  return `---
date: ${dateIso}
tags: ${tagLiteral}
jikePostId: ${postId}
---

${bodyParts.join('\n')}
`;
}
