import { writeFile, readdir } from 'node:fs/promises';
import { resolve, relative, sep } from 'node:path';
const root = resolve('dist');
async function pages(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  return (
    await Promise.all(
      entries.map((e) =>
        e.isDirectory()
          ? pages(resolve(dir, e.name))
          : e.name === 'index.html'
            ? [relative(root, resolve(dir, e.name)).split(sep).join('/')]
            : [],
      ),
    )
  ).flat();
}
const aliases = ['/navy-variant.html / 301', '/index.html / 301', '/dark-variant.html / 301'];
for (const file of await pages(root)) {
  if (file === 'index.html') continue;
  const path = '/' + file.replace(/index\.html$/, '');
  aliases.push(`${path.slice(0, -1)}.html ${path} 301`);
}
await writeFile(resolve(root, '_redirects'), aliases.join('\n') + '\n');
if (
  process.env.SITE_INDEXING === 'disabled' ||
  (process.env.CONTEXT && process.env.CONTEXT !== 'production')
) {
  await writeFile(resolve(root, '_headers'), '/*\n  X-Robots-Tag: noindex, nofollow\n');
}
console.log(`Generated ${aliases.length} legacy URL redirects.`);
