import { newsPosts, useCases } from './content';
export async function siteRoutes() {
  return [
    '/',
    ...[
      'products',
      'use-cases',
      'news',
      'contact',
      'team',
      'about-us',
      'faq',
      'book-demo',
      'privacy-policy',
    ].map((s) => `/${s}/`),
    ...(await newsPosts()).map((p) => `/news/${p.slug}/`),
    ...(await useCases()).map((c) => `/use-cases/${c.slug}/`),
  ];
}
