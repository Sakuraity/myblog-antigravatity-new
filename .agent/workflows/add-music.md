---
description: Add a music item to the library from a link (Spotify/YouTube etc.)
---

# Add Music Workflow

Trigger this workflow when the user asks to "Add music" or "添加音乐" with a link.

1.  **Extract Metadata**:
    *   Use `read_url_content` or `browser_subagent` to fetch the title, artist, and cover image from the provided URL.
2.  **Download Cover Image**:
    *   **CRITICAL**: Do NOT use the remote URL directly for `coverImage`.
    *   Download the image and save it to `/Users/sakuraity/Projects/myblog-antigravatity-main/public/images/library-covers/`.
    *   Name the file based on the artist and title (slugified).
3.  **Create Content File**:
    *   Create a new file in `/Users/sakuraity/Projects/myblog-antigravatity-main/src/content/library/`.
    *   Filename: `[kebab-case-title].md`.
    *   Frontmatter:
        ```yaml
        ---
        type: music
        title: "[Title]"
        subtitle: "[Artist]"
        coverImage: "/images/library-covers/[filename.jpg]"
        spotifyUrl: "[Original URL]"
        comment: "一句话简介"
        date: [Current Date YYYY-MM-DD]
        rating: 5
        ---
        ```
    *   Body: Empty or optional notes.
