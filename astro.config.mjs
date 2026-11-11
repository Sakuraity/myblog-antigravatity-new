import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import cloudflare from '@astrojs/cloudflare';
import { remarkPreserveNoteBreaks, remarkStripJikeOriginal } from './src/lib/jike-note.mjs';

// https://astro.build/config
export default defineConfig({
  // 站点域名：部署到自定义域名后修改这里，并同步更新 src/config.ts 的 SITE.url
  site: 'https://kangyuan-blog.vercel.app',
  output: 'hybrid',
  adapter: cloudflare(),
  integrations: [tailwind(), sitemap()],
  markdown: {
    remarkPlugins: [remarkStripJikeOriginal, remarkPreserveNoteBreaks],
  },
});