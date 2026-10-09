export const allowIndexing =
  import.meta.env.PROD &&
  process.env.SITE_INDEXING !== 'disabled' &&
  (!process.env.CONTEXT || process.env.CONTEXT === 'production');

interface Metadata {
  site: URL;
  canonical: URL;
  title: string;
  description: string;
  image: string;
  article?: Record<string, unknown>;
}

export function structuredData({ site, canonical, title, description, image, article }: Metadata) {
  const origin = site.href;
  const organization = { '@id': new URL('#organization', site).href };
  const website = { '@id': new URL('#website', site).href };
  const pageId = canonical.href + '#webpage';
  const graph: Record<string, unknown>[] = [
    {
      ...organization,
      '@type': 'Organization',
      name: 'Dipai',
      legalName: 'Dipai AS',
      url: origin,
      logo: new URL('/assets/dipai-logo.svg', site).href,
      email: 'contact@dipai.no',
      telephone: '+47 902 09 249',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Borgundvegen 340',
        postalCode: '6009',
        addressLocality: 'Ålesund',
        addressCountry: 'NO',
      },
      sameAs: ['https://www.linkedin.com/company/dipai-as/'],
    },
    {
      ...website,
      '@type': 'WebSite',
      name: 'Dipai',
      url: origin,
      publisher: organization,
      inLanguage: 'en',
    },
    {
      '@type': 'WebPage',
      '@id': pageId,
      url: canonical.href,
      name: title,
      description,
      isPartOf: website,
      about: organization,
      inLanguage: 'en',
      primaryImageOfPage: { '@type': 'ImageObject', url: image },
      ...(article ? { mainEntity: { '@id': canonical.href + '#article' } } : {}),
    },
  ];
  if (article) {
    const { '@context': _context, ...data } = article;
    graph.push({
      ...data,
      '@id': canonical.href + '#article',
      url: canonical.href,
      mainEntityOfPage: { '@id': pageId },
      author: organization,
      publisher: organization,
      image: [image],
      inLanguage: 'en',
    });
    const collection = canonical.pathname.startsWith('/news/') ? 'news' : 'use-cases';
    graph.push({
      '@type': 'BreadcrumbList',
      '@id': canonical.href + '#breadcrumb',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: origin },
        {
          '@type': 'ListItem',
          position: 2,
          name: collection === 'news' ? 'News' : 'Use cases',
          item: new URL(`/${collection}/`, site).href,
        },
        { '@type': 'ListItem', position: 3, name: title, item: canonical.href },
      ],
    });
  }
  return { '@context': 'https://schema.org', '@graph': graph };
}
