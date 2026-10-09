import { defineConfig } from 'astro/config';
import enquiriesIntegration from './server/dev-integration.mjs';
export default defineConfig({
  site: process.env.SITE_URL || 'https://dipai.no',
  output: 'static',
  integrations: [enquiriesIntegration()],
  trailingSlash: 'always',
  build: { format: 'directory' },
  server: { host: '127.0.0.1', port: 48767 },
  vite: { build: { cssMinify: true } },
});
