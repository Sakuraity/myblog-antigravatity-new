const JIKE_USER_ID = '815916E7-5BD5-4EC6-9EB1-14458F0E11CE';
const NOTE_TIME_ZONE = 'Asia/Shanghai';

/** Calendar day in China, so 00:00–07:59 Shanghai does not fall on the previous UTC day. */
export function formatNoteDate(date, month = 'short') {
  return new Date(date).toLocaleDateString('zh-CN', {
    timeZone: NOTE_TIME_ZONE,
    year: 'numeric',
    month,
    day: 'numeric',
  });
}

export function formatNoteTime(date) {
  return new Date(date).toLocaleTimeString('zh-CN', {
    timeZone: NOTE_TIME_ZONE,
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  });
}
const POST_ID_RE = /okjike\.com\/u\/[^/"'\s]+\/post\/([a-f0-9]+)/i;

function originalAnchorRe() {
  return /<a\b[^>]*okjike\.com\/u\/[^"']*\/post\/[a-f0-9]+[^>]*>[\s\S]*?<\/a>/gi;
}

export function jikePostUrl(postId) {
  return `https://web.okjike.com/u/${JIKE_USER_ID}/post/${postId}`;
}

export function extractJikePostId(text = '') {
  const match = String(text).match(POST_ID_RE);
  return match?.[1] ?? null;
}

export function resolveJikeOriginalUrl({ jikePostId, body } = {}) {
  if (jikePostId) return jikePostUrl(String(jikePostId));
  const postId = extractJikePostId(body);
  return postId ? jikePostUrl(postId) : null;
}

export function stripJikeOriginalAnchor(body = '') {
  return String(body).replace(originalAnchorRe(), '');
}

/**
 * Plain-text preview. Drops the synced "查看原文" anchor, and keeps Jike's
 * newlines: one newline is a line break, a blank line is a paragraph gap.
 */
export function notePlainText(body = '') {
  return stripJikeOriginalAnchor(body)
    .replace(/<[^>]+>/g, '')
    .replace(/!\[[^\]]*\]\([^)]+\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/查看原文/g, '')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/** Local and remote images embedded in a note, in source order. */
export function noteImageSrcs(body = '') {
  const cleaned = stripJikeOriginalAnchor(body);
  const srcs = [];
  const patterns = [
    /!\[[^\]]*\]\(\s*<?([^)\s>]+)>?(?:\s+"[^"]*")?\s*\)/g,
    /<img\b[^>]*\bsrc=["']([^"']+)["']/gi,
  ];
  for (const pattern of patterns) {
    for (const match of cleaned.matchAll(pattern)) {
      if (match[1]) srcs.push(match[1]);
    }
  }
  return [...new Set(srcs)];
}

/** Keep a length clamp without gluing lines back together. */
export function clampNotePreview(text = '', limit = 140) {
  const value = String(text);
  if (value.length <= limit) return value;
  let cut = value.slice(0, limit);
  const lastBreak = cut.lastIndexOf('\n');
  if (lastBreak >= Math.floor(limit * 0.6)) {
    cut = cut.slice(0, lastBreak);
  } else {
    cut = cut.replace(/[ \t]+\S*$/, '');
  }
  return `${cut.replace(/[ \t]+$/g, '').replace(/\n+$/g, '')}…`;
}

function isBlankHtml(value) {
  return !String(value).replace(originalAnchorRe(), '').trim();
}

/**
 * Remark plugin. Runs before HTML is parsed, and removes the standard Jike
 * "查看原文" anchor from note (and any other) markdown. The page renders that
 * link itself, outside the body.
 */
export function remarkStripJikeOriginal() {
  return (tree) => {
    stripHtmlNodes(tree);
  };
}

/**
 * Jike treats every newline as a line break. Only notes get this; blog posts
 * keep CommonMark soft wrapping. Blank lines stay separate paragraphs.
 */
export function remarkPreserveNoteBreaks() {
  return (tree, file) => {
    const filePath = decodeURIComponent(String(file?.path || file?.history?.[0] || ''));
    if (!filePath.includes('/content/notes/')) return;
    splitNewlines(tree);
  };
}

function splitNewlines(node) {
  if (!node || !Array.isArray(node.children)) return;
  if (node.type === 'code' || node.type === 'inlineCode') return;
  node.children = node.children.flatMap((child) => {
    if (child.type === 'text' && typeof child.value === 'string' && child.value.includes('\n')) {
      const parts = child.value.split('\n');
      const out = [];
      parts.forEach((part, index) => {
        if (index > 0) out.push({ type: 'break' });
        if (part.length > 0) out.push({ type: 'text', value: part });
      });
      return out;
    }
    splitNewlines(child);
    return [child];
  });
}

function stripHtmlNodes(node) {
  if (!node || !Array.isArray(node.children)) return;
  node.children = node.children.flatMap((child) => {
    if (child.type === 'html' && typeof child.value === 'string' && originalAnchorRe().test(child.value)) {
      const next = child.value.replace(originalAnchorRe(), '');
      if (!next.trim()) return [];
      child.value = next;
    }
    stripHtmlNodes(child);
    if (child.type === 'paragraph' && isEmptyParagraph(child)) return [];
    return [child];
  });
}

function isEmptyParagraph(node) {
  if (!Array.isArray(node.children) || node.children.length === 0) return true;
  return node.children.every((child) => {
    if (child.type === 'text') return !String(child.value).trim();
    if (child.type === 'html') return isBlankHtml(child.value);
    return false;
  });
}
