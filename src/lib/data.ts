import materialsData from '../../data/materials.json';
import type { Material } from './types';

const materials = materialsData as Material[];

/**
 * Приводит материал к единому виду: подставляет дефолты для новых полей,
 * чтобы старые записи в data/materials.json не теряли их.
 */
function normalizeMaterial(material: Material): Material {
  return {
    ...material,
    translated: material.translated === true,
    sourceLang: material.sourceLang
  };
}

export function getAllMaterials(): Material[] {
  return materials
    .map(normalizeMaterial)
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
}

export function getFreshIssue(days = 7, limit = 7): Material[] {
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  return getAllMaterials()
    .filter(material => new Date(material.publishedAt).getTime() >= cutoff)
    .slice(0, limit);
}

export function getMaterialBySlug(slug: string): Material | undefined {
  return getAllMaterials().find(material => material.id === slug);
}

export function getCategories(): string[] {
  return [...new Set(getAllMaterials().map(material => material.category))];
}

export function getSources(): string[] {
  return [...new Set(getAllMaterials().map(material => material.source))];
}

export function getContentTypes(): string[] {
  return [...new Set(getAllMaterials().map(material => material.contentType))];
}
