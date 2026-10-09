import type { APIRoute } from 'astro';
import { allowIndexing } from '../lib/seo';
export const GET: APIRoute = ({ site }) =>
  new Response(
    allowIndexing
      ? `User-agent: *\nAllow: /\nDisallow: /api/\nSitemap: ${new URL('sitemap.xml', site)}\n`
      : 'User-agent: *\nDisallow: /\n',
    { headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
  );
