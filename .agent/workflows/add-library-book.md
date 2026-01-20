---
description: Add a new book to the library with metadata and cover image
---

This workflow guides you through adding a new book to the `src/content/library/` collection.

1.  **Gather Information**
    Ask the user for:
    *   Book Title
    *   Author
    *   Status (reading, finished, wishlist)
    *   Rating (1-5)
    *   (Optional) Short Comment/Review
    *   (Optional) Date finished

2.  **Fetch Douban Metadata & Cover**
    Use the following commands to find the correct Douban ID and cover image.
    *   **Search**: `curl -L -A "Mozilla/5.0" "https://book.douban.com/subject_search?search_text=[Title]+[Author]"` -> Identify Subject ID.
    *   **Verify**: Fetch the page `https://book.douban.com/subject/[ID]/` and check the `<title>` to ensure it's the correct book (and not a movie/DVD).
    *   **Extract Cover**: Find the high-res image URL (typically in `#mainpic` or `view/subject/l/public`).
    *   **Extract Description**: Find the book introduction text in `#link-report .intro`. Use the first 1-2 sentences as the `comment` field.
    *   **Douban Link**: Record `https://book.douban.com/subject/[ID]/`.

3.  **Download Cover Image**
    *   Generate a kebab-case file basename from the English title (or Pinyin if Chinese): `[kebab-title].jpg`.
    *   Download using Referer to avoid hotlink protection:
        ```bash
        curl -L -A "Mozilla/5.0" -e "https://book.douban.com/" -o public/images/library-covers/[kebab-title].jpg "[Image_URL]"
        ```
    *   Verify file size is > 1KB.

4.  **Create Markdown Entry**
    *   File Path: `src/content/library/book-[kebab-title].md`
    *   Template:
        ```markdown
        ---
        type: "book"
        title: "[Title]"
        author: "[Author]"
        status: "[status]"
        # rating: [rating] (OMIT this field if rating is 0 or undefined, do not set to 0)
        link: "https://book.douban.com/subject/[ID]/"
        comment: "[Book Description from Douban - first 1-2 sentences of intro]"
        date: [YYYY-MM-DD]
        coverImage: "/images/library-covers/[kebab-title].jpg"
        ---
        ```

5.  **Verification**
    *   Run `npm run dev` (if not running) and check the `/library` page to verify the card rendering and image loading.
