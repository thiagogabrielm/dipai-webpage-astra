import type { ImageMetadata } from 'astro';

// Keep content records readable while Astro imports and optimizes each local image.
const images = import.meta.glob<ImageMetadata>(
  '/src/assets/{news,team}/*.{webp,jpg,jpeg,png,avif}',
  {
    eager: true,
    import: 'default',
  },
);
export function optimizedMedia(path: string): ImageMetadata {
  const key = '/src/' + path.replace(/^\//, '');
  const image = images[key];
  if (!image) throw new Error(`Missing content image: ${path}`);
  return image;
}
