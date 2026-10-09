import { defineCollection } from 'astro:content';
import { file } from 'astro/loaders';
import { z } from 'astro/zod';
const slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const article = {
  slug,
  title: z.string().min(1),
  category: z.string().min(1),
  summary: z.string().min(1),
};
const loader = (name: string) =>
  file(`src/data/${name}.json`, {
    parser: (text: string) =>
      JSON.parse(text).map((item: { slug: string }) => ({ ...item, id: item.slug })),
  });
const news = defineCollection({
  loader: loader('news'),
  schema: z.object({
    ...article,
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    paragraphs: z.array(z.string()).min(1),
    source_url: z.url(),
    images: z.array(z.object({ src: z.string(), alt: z.string(), caption: z.string().optional() })),
    contain: z.boolean().optional(),
  }),
});
const metric = z.object({
  kind: z.literal('metric'),
  tone: z.string(),
  signal: z.boolean().optional(),
  label: z.string(),
  prefix: z.string().optional(),
  value: z.string(),
  unit: z.string(),
  support_value: z.string(),
  support_label: z.string(),
  basis: z.string(),
});
const words = z.object({
  kind: z.enum(['context', 'cycle']),
  tone: z.string(),
  signal: z.boolean().optional(),
  label: z.string(),
  words: z.array(z.string()).length(2),
  tags: z.array(z.string()),
  basis: z.string(),
});
const useCases = defineCollection({
  loader: loader('use-cases'),
  schema: z.object({
    ...article,
    intro: z.string(),
    sections: z.array(z.object({ heading: z.string(), paragraphs: z.array(z.string()) })),
    figures: z.array(z.object({ src: z.string(), alt: z.string(), caption: z.string() })),
    outcome: z.string(),
    evidence_note: z.string(),
    metrics: z.array(z.object({ label: z.string(), value: z.string() })).optional(),
    card_visual: z.discriminatedUnion('kind', [metric, words]),
  }),
});
export const collections = { news, useCases };
