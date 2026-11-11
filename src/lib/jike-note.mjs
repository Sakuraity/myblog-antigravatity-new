const JIKE_USER_ID = '815916E7-5BD5-4EC6-9EB1-14458F0E11CE';
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
  return String(body).replace(originalAnchorRe(), ' ');
}

/** Plain-text preview. Drops the synced "查看原文" anchor so it never reads as body copy. */
export function notePlainText(body = '') {
  return stripJikeOriginalAnchor(body)
    .replace(/<[^>]+>/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]+\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/https?:\/\/\S+/g, ' ')
    .replace(/^[#>*\-\d.\s]+/gm, '')
    .replace(/查看原文/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
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
