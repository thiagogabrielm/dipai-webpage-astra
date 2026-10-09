import { readFile, readdir, stat } from 'node:fs/promises';
import { resolve, relative } from 'node:path';
import { parse } from 'parse5';
const root = resolve('dist');
const site = new URL(process.env.SITE_URL || 'https://dipai.no');
const preview = process.env.SITE_INDEXING === 'disabled' || (process.env.CONTEXT && process.env.CONTEXT !== 'production');
const errors = [];
async function walk(dir) {
  return (await Promise.all((await readdir(dir, { withFileTypes: true })).map(e => e.isDirectory() ? walk(resolve(dir, e.name)) : [resolve(dir, e.name)]))).flat();
}
const pages = (await walk(root)).filter(p => p.endsWith('.html'));
const titles = new Set();
const routes = [];
function nodes(tree) { return [tree, ...(tree.childNodes || []).flatMap(nodes)]; }
for (const file of pages) {
  const route = '/' + relative(root, file).replace(/index\.html$/, '');
  const tree = parse(await readFile(file, 'utf8'));
  const all = nodes(tree).map(n => ({ ...n, attrs: Object.fromEntries((n.attrs || []).map(a => [a.name, a.value])) }));
  const meta = key => all.find(n => n.tagName === 'meta' && (n.attrs.name === key || n.attrs.property === key))?.attrs.content;
  const canonical = all.filter(n => n.tagName === 'link' && n.attrs.rel === 'canonical');
  const expected = new URL(route, site).href;
  if (canonical.length !== 1 || canonical[0].attrs.href !== expected) errors.push(`${route}: incorrect canonical`);
  const title = all.find(n => n.tagName === 'title')?.childNodes?.[0]?.value;
  if (!title || titles.has(title)) errors.push(`${route}: missing or duplicate title`);
  titles.add(title);
  if (!meta('description')) errors.push(`${route}: no description`);
  if (meta('og:url') !== expected) errors.push(`${route}: inconsistent Open Graph URL`);
  for (const key of ['og:image', 'og:image:alt', 'twitter:card', 'twitter:image', 'twitter:image:alt']) if (!meta(key)) errors.push(`${route}: missing ${key}`);
  const image = new URL(meta('og:image'), site);
  if (image.origin !== site.origin) errors.push(`${route}: non-local sharing image`);
  try { if (!(await stat(resolve(root, '.' + image.pathname))).isFile()) throw Error(); }
  catch { errors.push(`${route}: missing sharing image ${image.pathname}`); }
  const noindex = preview || route === '/404.html';
  if (meta('robots')?.includes('noindex') !== Boolean(noindex)) errors.push(`${route}: incorrect indexing directive`);
  if (route === '/404.html') continue;
  routes.push(expected);
  const scripts = all.filter(n => n.tagName === 'script' && n.attrs.type === 'application/ld+json');
  try {
    if (scripts.length !== 1) throw Error('expected one graph');
    const graph = JSON.parse(scripts[0].childNodes[0].value)['@graph'];
    for (const type of ['Organization','WebSite','WebPage']) if (!graph.some(n => n['@type'] === type)) throw Error(`missing ${type}`);
    const page = graph.find(n => n['@type'] === 'WebPage');
    if (page.url !== expected) throw Error('page URL mismatch');
    if (/^\/(news|use-cases)\/[^/]+\/$/.test(route)) {
      const article = graph.find(n => ['Article','NewsArticle'].includes(n['@type']));
      if (!article || article.mainEntityOfPage['@id'] !== expected + '#webpage' || !article.image?.length) throw Error('incomplete article');
      if (route.startsWith('/news/') && !article.datePublished) throw Error('missing news publication date');
      if (!graph.some(n => n['@type'] === 'BreadcrumbList')) throw Error('missing breadcrumbs');
    }
  } catch(error) { errors.push(`${route}: invalid structured data: ${error.message}`); }
}
const sitemap = await readFile(resolve(root, 'sitemap.xml'), 'utf8');
const locations = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(m => m[1]);
if (new Set(locations).size !== locations.length || locations.length !== routes.length || routes.some(url => !locations.includes(url))) errors.push('Sitemap does not match public routes');
const robots = await readFile(resolve(root, 'robots.txt'), 'utf8');
if (preview ? !robots.includes('Disallow: /\n') : !robots.includes(`Sitemap: ${new URL('/sitemap.xml', site).href}`)) errors.push('Incorrect robots.txt');
if (errors.length) { console.error(errors.join('\n')); process.exitCode = 1; }
else console.log(`Validated search metadata, sharing images, structured data and indexing for ${pages.length} pages (${preview ? 'preview' : 'production'}).`);
