---
description: How to strictly fetch high-resolution book covers from Douban
---

This workflow details the process to accurately identify and download high-quality book covers from Douban, avoiding incorrect matches or low-resolution thumbnails.

1.  **Search for Subject ID**
    Use `curl` to search Douban for the book using Title and Author.
    ```bash
    curl -L -A "Mozilla/5.0" "https://book.douban.com/subject_search?search_text=[Title]+[Author]" | grep -o 'subject/[0-9]*/' | head -n 1
    ```
    *Extract the numeric ID (e.g., `34439234`).*

2.  **Verify Page Title**
    Fetch the subject page and check the `<title>` tag to confirm it is the correct book.
    ```bash
    curl -L -A "Mozilla/5.0" "https://book.douban.com/subject/[Subject_ID]/" > temp_book.html
    grep "<title>" temp_book.html
    ```

3.  **Extract High-Res Image URL**
    Parse the HTML to find the cover image. Look for the distinct high-res pattern (usually in the `#mainpic` div or `li` matching `view/subject/l/public`).
    ```bash
    grep -o 'https://[^"]*doubanio[^"]*\.jpg' temp_book.html | head -n 1
    ```
    *Target URL format: `https://img[1-9].doubanio.com/view/subject/l/public/s[0-9]*.jpg`*

4.  **Download Image**
    Download the image using `curl` with a browser User-Agent and Referer to pass anti-hotlinking checks.
    ```bash
    curl -L -A "Mozilla/5.0" -e "https://book.douban.com/" -o public/images/library-covers/[filename].jpg "[Image_URL]"
    ```
