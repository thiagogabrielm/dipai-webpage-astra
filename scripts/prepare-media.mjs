import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises';
import { join, relative, resolve, sep } from 'node:path';
import sharp from 'sharp';
const root = resolve('public');
async function walk(dir) {
  return (
    await Promise.all(
      (await readdir(dir, { withFileTypes: true })).map((e) =>
        e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)],
      ),
    )
  ).flat();
}
// A deterministic social preview built from the existing vector brand asset.
const logo = (await readFile(join(root, 'assets/dipai-logo-light.svg'))).toString('base64');
const socialCard = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#1c2b39"/>
  <path d="M780 0L1200 300M900 0L1200 180M850 630L1200 390M1000 630L1200 510" stroke="#34475e" stroke-width="2"/>
  <image href="data:image/svg+xml;base64,${logo}" x="80" y="70" width="260" height="108"/>
  <g fill="#f2f6fa" font-family="Arial, sans-serif" font-size="64" font-weight="500">
    <text x="80" y="326">Vessel data.</text>
    <text x="80" y="407">Actionable insights.</text>
  </g>
  <circle cx="86" cy="532" r="6" fill="#ffd600"/>
  <text x="106" y="540" fill="#c2d1dd" font-family="Arial, sans-serif" font-size="24">dipai.no</text>
</svg>`;
await sharp(Buffer.from(socialCard)).png().toFile(join(root, 'assets/social-card.png'));
const dimensions = {};
for (const file of await walk(join(root, 'assets'))) {
  if (!/\.(png|jpe?g|webp|avif)$/i.test(file)) continue;
  const { width, height } = await sharp(file).metadata();
  dimensions['/' + relative(root, file).split(sep).join('/')] = { width, height };
}
await mkdir('src/generated', { recursive: true });
await writeFile('src/generated/image-dimensions.json', JSON.stringify(dimensions, null, 2) + '\n');
