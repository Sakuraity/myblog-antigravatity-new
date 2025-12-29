import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
  site: 'https://kangyuan-blog.vercel.app', // TODO: Update with actual domain
  output: 'hybrid',
  adapter: cloudflare(),
  integrations: [tailwind(), sitemap()]
});