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
  /** Материал переведён на русский автоматически. */
  translated?: boolean;
  /** Язык оригинала, если материал переводили. */
  sourceLang?: string;
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
  translation: TranslationConfig;
}

/** Настройки автоматического перевода иноязычных материалов. */
export interface TranslationConfig {
  /** Включён ли перевод. Выключается без падения конвейера. */
  enabled: boolean;
  /** Модель OpenRouter. Задаётся только здесь, в коде не хардкодится. */
  model: string;
  /** Пометка с альтернативными моделями — для владельца проекта. */
  comment?: string;
  maxTokens: number;
  temperature: number;
  /** Таймаут запроса в миллисекундах. */
  timeoutMs: number;
  /** Промпт перевода с плейсхолдером {text}. */
  prompt: string;
}
