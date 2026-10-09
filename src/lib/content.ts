import caseOrder from '../data/use-cases.json';
import { getCollection } from 'astro:content';
export async function newsPosts() {
  return (await getCollection('news'))
    .map((entry) => entry.data)
    .sort((a, b) => b.date.localeCompare(a.date));
}
export async function useCases() {
  return (await getCollection('useCases'))
    .map((entry) => entry.data)
    .sort(
      (a, b) =>
        caseOrder.findIndex((c) => c.slug === a.slug) -
        caseOrder.findIndex((c) => c.slug === b.slug),
    );
}
export function displayDate(date: string) {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(date + 'T00:00:00Z'));
}
export function articleSchema(
  title: string,
  description: string,
  extra: Record<string, unknown> = {},
) {
  return {
    '@type': 'Article',
    headline: title,
    description,
    ...extra,
  };
}
