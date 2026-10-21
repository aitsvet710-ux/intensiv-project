import type { Material } from './types';

/**
 * Добавляет базовый путь (GitHub Pages) к внутренним ссылкам.
 * Пример: withBase('/archive/') -> '/intensiv-project/archive/'
 */
export function withBase(path: string): string {
  const base = (import.meta.env?.BASE_URL ?? '/').replace(/\/$/, '');
  if (!base) return path;
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export function getDaysAgo(dateString: string): number {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function sortByDate(materials: Material[], order: 'asc' | 'desc' = 'desc'): Material[] {
  return [...materials].sort((a, b) => {
    const dateA = new Date(a.publishedAt).getTime();
    const dateB = new Date(b.publishedAt).getTime();
    return order === 'desc' ? dateB - dateA : dateA - dateB;
  });
}

export function filterByDays(materials: Material[], days: number): Material[] {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return materials.filter(m => new Date(m.publishedAt) >= cutoff);
}
