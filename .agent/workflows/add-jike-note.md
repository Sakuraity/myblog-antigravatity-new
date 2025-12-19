---
description: Add a note from a Jike (即刻) link
---

# Add Jike Note Workflow

// turbo-all

Trigger this workflow when the user asks to "Add Jike note" or "添加即刻" with a link.

1.  **Open Link**:
    *   Use `browser_subagent` to open the provided Jike URL.
2.  **Handle Login/Visibility**:
    *   Check if the content is visible.
    *   If a login page appears, **WAIT 20 seconds** for the user to manually log in via the browser window.
3.  **Extract Content**:
    *   Extract the post text.
    *   Extract all image URLs.
4.  **Create Note File**:
    *   Create a new file in `/Users/sakuraity/Projects/myblog-antigravatity-main/src/content/notes/`.
    *   Filename: `[YYYY-MM-DD-short-slug].md`.
    *   Frontmatter:
        ```yaml
        ---
        date: [Current ISO Time with Timezone e.g., 2025-12-19T14:05:00+08:00]
        tags: ["Jike", "随想"]
        ---
        ```
    *   Body:
        *   The extracted text.
        *   Any extracted images. **Use standard Markdown syntax `![image](url)`**. Do not use HTML `<img>` tags for images.
        *   A link to the original post:
            ```html
            <a href="[URL]" target="_blank" class="inline-flex items-center gap-1.5 px-3 py-1.5 mt-1 text-xs font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-zinc-800 rounded-full hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors no-underline group-hover:bg-gray-200 dark:group-hover:bg-zinc-700">
              <span>查看原文</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-external-link"><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>
            </a>
            ```
