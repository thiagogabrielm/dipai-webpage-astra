import { defineConfig } from 'astro/config';
import enquiriesIntegration from './server/dev-integration.mjs';
export default defineConfig({
  site: process.env.SITE_URL || 'https://dipai.no',
  output: 'static',
  integrations: [enquiriesIntegration()],
  trailingSlash: 'always',
  build: { format: 'directory' },
  server: { host: '127.0.0.1', port: 48767 },
  vite: {
    // Prepare the lazy-loaded globe library before the first scroll reaches it.
    optimizeDeps: { include: ['d3-geo'] },
    build: { cssMinify: true },
  },
});
