import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import aiConfigJson from '../../src/config/ai.json';
import siteConfig from '../../src/config/site.json';
import type { AIConfig } from '../../src/lib/types';
import { detectLanguage, detectLanguageCode } from '../../src/lib/language';

export { detectLanguage };

const __dirname = dirname(fileURLToPath(import.meta.url));
const CACHE_DIR = resolve(__dirname, '..', 'cache');
const CACHE_FILE = resolve(CACHE_DIR, 'translations.json');

/**
 * Минимальная длина текста, для которой эвристика языка надёжна.
 * Короткие строки («Обзор», «Jig») переводим без оглядки на эвристику.
 */
const MIN_RELIABLE_LENGTH = 20;

export interface TranslationResult {
  /** Переведённый текст или оригинал, если перевести не удалось. */
  text: string;
  /** Удалось ли перевести. */
  translated: boolean;
  /** Модель, которой перевели. */
  model?: string;
}

/** Запись кэша переводов. */
interface CacheEntry {
  text: string;
  model: string;
  createdAt: string;
}

type CacheMap = Record<string, CacheEntry>;

/** Кэш в памяти — читаем с диска один раз за запуск. */
let cache: CacheMap | null = null;

/** Предупреждение о отсутствии ключа показываем один раз за запуск. */
let noKeyWarned = false;

function getApiKey(): string | undefined {
  return process.env.OPENROUTER_API_KEY || process.env.LLM_API_KEY || undefined;
}

/**
 * Приводит текст к ASCII: HTTP-заголовки принимают только Latin-1,
 * кириллица в `X-Title` обрывает запрос.
 */
function asciiTitle(text: string): string {
  const map: Record<string, string> = {
    а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z',
    и: 'i', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r',
    с: 's', т: 't', у: 'u', ф: 'f', х: 'h', ц: 'c', ч: 'ch', ш: 'sh',
    щ: 'sch', ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya'
  };
  return (text ?? '')
    .toLowerCase()
    .replace(/[а-яё]/g, char => map[char] ?? char)
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Читает кэш переводов. Если файла нет — пустой кэш, если файл повреждён —
 * предупреждение и пустой кэш (конвейер не падает).
 */
function loadCache(): CacheMap {
  if (cache) return cache;

  if (!existsSync(CACHE_FILE)) {
    cache = {};
    return cache;
  }

  try {
    // BOM от редакторов и Windows-инструментов не должен ломать разбор.
    const raw = readFileSync(CACHE_FILE, 'utf-8').replace(/^\uFEFF/, '');
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      throw new Error('ожидался объект');
    }
    cache = parsed as CacheMap;
  } catch (error) {
    console.warn(`  ⚠ Кэш переводов повреждён (${(error as Error).message}) — продолжаю с пустым кэшем`);
    cache = {};
  }

  return cache;
}

/** Сохраняет кэш на диск. Ошибка записи не должна ронять конвейер. */
function saveCache(): void {
  if (!cache) return;
  try {
    mkdirSync(CACHE_DIR, { recursive: true });
    writeFileSync(CACHE_FILE, `${JSON.stringify(cache, null, 2)}\n`, 'utf-8');
  } catch (error) {
    console.warn(`  ⚠ Не удалось сохранить кэш переводов: ${(error as Error).message}`);
  }
}

/**
 * Ключ кэша: SHA-256 от текста, целевого языка и модели.
 * Смена модели переводов даёт новый ключ — старые записи не мешают.
 */
export function translationCacheKey(text: string, model: string): string {
  return createHash('sha256').update(`${text}→ru${model}`).digest('hex');
}

/**
 * Переводит текст на русский через OpenAI-совместимый API.
 *
 * Никогда не бросает исключение: при любой проблеме (нет ключа, таймаут,
 * ошибка API, пустой ответ) возвращает оригинал с `translated: false`.
 */
export async function translateToRussian(
  text: string,
  sourceLang?: string,
  config: AIConfig = aiConfigJson as AIConfig
): Promise<TranslationResult> {
  const original = text ?? '';
  const trimmed = original.trim();
  if (!trimmed) return { text: original, translated: false };

  const translation = config.translation;
  if (!translation?.enabled) return { text: original, translated: false };

  const apiKey = getApiKey();
  if (!apiKey) {
    if (!noKeyWarned) {
      console.warn('  ⚠ Перевод пропущен: нет ключа (OPENROUTER_API_KEY или LLM_API_KEY)');
      noKeyWarned = true;
    }
    return { text: original, translated: false };
  }

  // Длинные тексты определяем эвристикой, короткие — по языку источника.
  if (trimmed.length >= MIN_RELIABLE_LENGTH) {
    if (detectLanguage(trimmed) === 'ru') return { text: original, translated: false };
  } else if (sourceLang === 'ru') {
    return { text: original, translated: false };
  }

  const key = translationCacheKey(trimmed, translation.model);
  const store = loadCache();
  const cached = store[key];
  if (cached?.text) {
    return { text: cached.text, translated: true, model: cached.model };
  }

  const endpoint =
    config.provider === 'openrouter'
      ? 'https://openrouter.ai/api/v1/chat/completions'
      : 'https://api.openai.com/v1/chat/completions';

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${apiKey}`
  };
  if (config.provider === 'openrouter') {
    headers['HTTP-Referer'] = 'https://github.com/aitsvet710-ux/intensiv-project';
    headers['X-Title'] = asciiTitle(siteConfig.name);
  }

  const prompt = translation.prompt.replace('{text}', trimmed.replace(/"/g, "'"));

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), translation.timeoutMs);

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      signal: controller.signal,
      body: JSON.stringify({
        model: translation.model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: translation.maxTokens,
        temperature: translation.temperature
      })
    });

    if (!response.ok) {
      console.warn(`  ⚠ Перевод: API ответил статусом ${response.status} — оставляю оригинал`);
      return { text: original, translated: false };
    }

    const data = (await response.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const translated = data.choices?.[0]?.message?.content?.trim().replace(/^["']|["']$/g, '').trim();

    if (!translated) {
      console.warn('  ⚠ Перевод: пустой ответ — оставляю оригинал');
      return { text: original, translated: false };
    }

    store[key] = {
      text: translated,
      model: translation.model,
      createdAt: new Date().toISOString()
    };
    saveCache();

    return { text: translated, translated: true, model: translation.model };
  } catch (error) {
    console.warn(`  ⚠ Перевод не удался (${(error as Error).message}) — оставляю оригинал`);
    return { text: original, translated: false };
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Определяет язык текста: 'ru' или код иноязычного источника.
 * Используется, чтобы записать в материал язык оригинала.
 */
export function sourceLanguageOf(text: string): string {
  const code = detectLanguageCode(text);
  return code === 'ru' ? 'ru' : code;
}
