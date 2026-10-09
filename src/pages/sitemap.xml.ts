import type { APIRoute } from 'astro';
import { siteRoutes } from '../lib/routes';
export const GET: APIRoute = async ({ site }) =>
  new Response(
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${(await siteRoutes()).map((route) => `<url><loc>${new URL(route, site)}</loc></url>`).join('')}</urlset>`,
    { headers: { 'Content-Type': 'application/xml' } },
  );
