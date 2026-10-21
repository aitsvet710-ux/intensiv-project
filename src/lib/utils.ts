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

/**
 * Русское склонение числительных.
 * plural(5, 'день', 'дня', 'дней') → 'дней'
 */
export function plural(count: number, one: string, few: string, many: string): string {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
}

/**
 * Относительная дата на русском: «сегодня», «вчера», «3 дня назад».
 */
export function relativeDate(dateString: string): string {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return '';

  const days = getDaysAgo(dateString);
  if (days === 0) return 'сегодня';
  if (days === 1) return 'вчера';
  if (days < 7) return `${days} ${plural(days, 'день', 'дня', 'дней')} назад`;
  if (days < 31) {
    const weeks = Math.floor(days / 7);
    return `${weeks} ${plural(weeks, 'неделю', 'недели', 'недель')} назад`;
  }
  if (days < 365) {
    const months = Math.floor(days / 30);
    return `${months} ${plural(months, 'месяц', 'месяца', 'месяцев')} назад`;
  }
  const years = Math.floor(days / 365);
  return `${years} ${plural(years, 'год', 'года', 'лет')} назад`;
}

/**
 * Приблизительное время чтения в минутах по объёму текста.
 */
export function readingMinutes(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 120));
}

/**
 * Подпись времени чтения: «3 мин».
 */
export function readingTime(text: string): string {
  return `${readingMinutes(text)} мин`;
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
