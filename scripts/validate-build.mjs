import { readFile, readdir, stat } from 'node:fs/promises';
import { resolve, relative, extname } from 'node:path';
import { parse } from 'parse5';
const root = resolve('dist');
async function walk(dir) {
  return (
    await Promise.all(
      (await readdir(dir, { withFileTypes: true })).map((e) =>
        e.isDirectory() ? walk(resolve(dir, e.name)) : [resolve(dir, e.name)],
      ),
    )
  ).flat();
}
const files = await walk(root),
  errors = [],
  pages = new Map(),
  assets = new Set();
function visit(node, fn) {
  fn(node);
  for (const child of node.childNodes || []) visit(child, fn);
  if (node.content) visit(node.content, fn);
}
for (const file of files.filter((f) => f.endsWith('.html'))) {
  const route = '/' + relative(root, file).replace(/index\.html$/, '');
  const html = await readFile(file, 'utf8'),
    tree = parse(html),
    ids = new Set(),
    links = [];
  let h1 = 0,
    main = 0,
    headers = 0,
    footers = 0;
  visit(tree, (node) => {
    const attrs = Object.fromEntries((node.attrs || []).map((a) => [a.name, a.value]));
    if (attrs.id) {
      if (ids.has(attrs.id)) errors.push(`${route}: duplicate id ${attrs.id}`);
      ids.add(attrs.id);
    }
    if (node.tagName === 'h1') h1++;
    if (node.tagName === 'main') main++;
    if (node.tagName === 'header' && attrs.class?.includes('site-header')) headers++;
    if (node.tagName === 'footer' && attrs.class?.includes('site-footer')) footers++;
    for (const name of ['href', 'src', 'action', 'data-image'])
      if (attrs[name]) links.push(attrs[name]);
    if (attrs.srcset) links.push(...attrs.srcset.split(',').map((s) => s.trim().split(/\s+/)[0]));
    if (node.tagName === 'img' && !('alt' in attrs))
      errors.push(`${route}: image without alt text`);
  });
  if (h1 !== 1) errors.push(`${route}: expected one h1, found ${h1}`);
  if (main !== 1 || headers !== 1 || footers !== 1) errors.push(`${route}: invalid shared layout`);
  pages.set(route, { ids, links });
  // Collect root-relative assets in inline scripts and styles as well as HTML.
  for (const match of html.matchAll(/\/(?:assets|_astro)\/[^\s"'<>`)}?#,]+/g)) assets.add(match[0]);
}
for (const [route, page] of pages) {
  for (const link of page.links) {
    if (/^(?:https?:|mailto:|tel:|data:|javascript:)/.test(link)) continue;
    const url = new URL(link, 'https://local.test' + route);
    const target = pages.get(url.pathname);
    if (target) {
      if (url.hash && !target.ids.has(decodeURIComponent(url.hash.slice(1))))
        errors.push(`${route}: missing anchor ${link}`);
      continue;
    }
    if (url.pathname.startsWith('/assets/') || url.pathname.startsWith('/_astro/'))
      assets.add(url.pathname);
    try {
      if (!(await stat(resolve(root, '.' + url.pathname))).isFile()) throw Error();
    } catch {
      errors.push(`${route}: missing local target ${link}`);
    }
  }
}
for (const file of files.filter((f) => ['.css', '.js'].includes(extname(f)))) {
  const source = await readFile(file, 'utf8');
  for (const match of source.matchAll(/\/(?:assets|_astro)\/[^\s"'<>`)}?#,]+/g))
    assets.add(match[0]);
}
for (const url of assets) {
  try {
    await stat(resolve(root, '.' + url));
  } catch {
    errors.push(`Missing build asset ${url}`);
  }
}
const unused = files.filter(
  (f) => f.startsWith(resolve(root, 'assets') + '/') && !assets.has('/' + relative(root, f)),
);
if (unused.length)
  errors.push('Unreferenced public assets: ' + unused.map((f) => relative(root, f)).join(', '));
const news = JSON.parse(await readFile('src/data/news.json', 'utf8')),
  cases = JSON.parse(await readFile('src/data/use-cases.json', 'utf8'));
if (pages.size !== 10 + news.length + cases.length)
  errors.push(`Expected ${10 + news.length + cases.length} pages, got ${pages.size}`);
if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else
  console.log(
    `Validated ${pages.size} pages, local links, anchors, image text, shared layouts and ${assets.size} assets.`,
  );
