import dimensions from '../generated/image-dimensions.json';
export function imageSize(src: string) {
  return dimensions[src as keyof typeof dimensions] || {};
}
export function heroSrcSet(src: string) {
  return [1280, 1920, 2560]
    .map((w) => `${src.replace('-2560.webp', `-${w}.webp`)} ${w}w`)
    .join(', ');
}
