export type Category = 
  | 'Инструмент' 
  | 'Проект/чертёж' 
  | 'Техника и приёмы' 
  | 'Безопасность' 
  | 'События/выставки' 
  | 'Вдохновение';

export type ContentType = 'статья' | 'видео' | 'обсуждение';

export type SourceType = 'telegram' | 'rss' | 'youtube';

export interface Source {
  name: string;
  url?: string;
  enabled: boolean;
  notes?: string;
}

export interface SourcesConfig {
  telegram: Source[];
  rss: Source[];
  youtube: Source[];
}

export interface Material {
  id: string;
  title: string;
  url: string;
  source: string;
  sourceType: SourceType;
  publishedAt: string;
  description?: string;
  summary?: string;
  category: Category;
  contentType: ContentType;
  imageUrl?: string;
  tags?: string[];
  collectedAt: string;
}

export interface SiteConfig {
  title: string;
  description: string;
  vkUrl: string;
}

export interface AIConfig {
  enabled: boolean;
  provider: string;
  model: string;
  maxTokens: number;
  temperature: number;
  prompt: string;
}
