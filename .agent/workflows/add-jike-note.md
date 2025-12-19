---
description: Add a note from a Jike (即刻) link
---

# Add Jike Note Workflow

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
        date: [Current Exact Time YYYY-MM-DDTHH:mm:ss]
        tags: ["Jike", "随想"]
        ---
        ```
    *   Body:
        *   The extracted text.
        *   Any extracted images.
        *   A link to the original post: `<a href="[URL]" class="button">View Original</a>` (or appropriate styling).
