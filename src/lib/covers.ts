import type { Material } from './types';
import { CATEGORY_META, DEFAULT_CATEGORY_SLUG } from './categories';
import { withBase } from './utils';

/**
 * Обложка материала.
 *
 * Основной путь — тематическая картинка по рубрике из `public/images/categories/`.
 * Точка расширения: если у материала появится поле `cover` со ссылкой на
 * сгенерированное изображение, оно будет использовано без правок кода.
 * Подключение генерации (IMAGE_GEN_API_KEY / OPENROUTER_API_KEY) — задача
 * владельца проекта, см. AGENTS.md.
 */
export function getCoverForMaterial(material: Material): string {
  const generated = (material as Material & { cover?: string }).cover;
  if (generated) return generated;
  return getCategoryCover(material.category);
}

/**
 * Обложка рубрики.
 */
export function getCategoryCover(category: string): string {
  const slug = CATEGORY_META[category as keyof typeof CATEGORY_META]?.slug ?? DEFAULT_CATEGORY_SLUG;
  return withBase(`/images/categories/${slug}.webp`);
}
