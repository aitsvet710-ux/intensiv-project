/**
 * Докач переводов: переводит на русский материалы, собранные до появления
 * шага перевода в конвейере.
 *
 * Идентификаторы, адреса, даты и рубрики не меняются: обновляются только
 * текстовые поля (`title`, `description`, `summary`) и флаги
 * `translated` / `sourceLang`. Если текст удалось перевести, резюме
 * генерируется заново — так же, как при обычном сборе.
 *
 * Использование:
 *   npm run backfill                    — перевести все материалы
 *   npm run backfill -- --dry-run       — показать изменения, не записывая файл
 *   npm run backfill -- --only <id>     — перевести только указанный материал
 *   npm run backfill -- --recategorize  — пересчитать рубрику и теги по русскому тексту
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import type { AIConfig, Material } from '../src/lib/types';
import { categorize, extractTags } from './categorize';
import { loadEnvFile, summarize } from './ai/summarize';
import { sourceLanguageOf, translateToRussian } from './ai/translate';
import type { RawMaterial } from './normalize';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const DATA_FILE = resolve(ROOT, 'data/materials.json');
const AI_CONFIG_FILE = resolve(ROOT, 'src/config/ai.json');

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const recategorize = args.includes('--recategorize');
const onlyIndex = args.indexOf('--only');
const onlyValue = onlyIndex === -1 ? undefined : args[onlyIndex + 1];
// Значение флага не должно быть другим флагом — иначе переводили бы не то.
const onlyId = onlyValue && !onlyValue.startsWith('--') ? onlyValue : undefined;

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(path, 'utf-8')) as T;
}

/**
 * Собирает черновик материала для резюме и рубрикации.
 */
function toRaw(material: Material): RawMaterial {
  return {
    title: material.title,
    url: material.url,
    source: material.source,
    sourceType: material.sourceType,
    publishedAt: material.publishedAt,
    description: material.description,
    imageUrl: material.imageUrl,
    contentType: material.contentType
  };
}

async function main(): Promise<void> {
  loadEnvFile(resolve(ROOT, '.env'));

  if (!existsSync(DATA_FILE)) {
    console.error('Не найден data/materials.json — сначала выполните npm run collect');
    process.exitCode = 1;
    return;
  }

  const config = readJson<AIConfig>(AI_CONFIG_FILE);

  if (!process.env.OPENROUTER_API_KEY && !process.env.LLM_API_KEY) {
    console.error(
      'Нужен ключ API: добавьте OPENROUTER_API_KEY (или LLM_API_KEY) в .env и повторите запуск.'
    );
    process.exitCode = 1;
    return;
  }

  if (!config.translation?.enabled) {
    console.error('Перевод выключен: в src/config/ai.json translation.enabled = false');
    process.exitCode = 1;
    return;
  }

  if (onlyIndex !== -1 && !onlyId) {
    console.error('После --only нужен id материала, например: npm run backfill -- --only <id>');
    process.exitCode = 1;
    return;
  }

  const materials = readJson<Material[]>(DATA_FILE);
  const targets = onlyId ? materials.filter(material => material.id === onlyId) : materials;

  if (onlyId && targets.length === 0) {
    console.error(`Материал с id «${onlyId}» не найден.`);
    process.exitCode = 1;
    return;
  }

  console.log(
    `Докач переводов: ${targets.length} из ${materials.length} материалов` +
      `${dryRun ? ' (--dry-run, файл не изменится)' : ''}`
  );

  const updated: Material[] = [];
  let translatedCount = 0;
  let skippedCount = 0;
  let failedCount = 0;

  for (const material of materials) {
    if (!targets.includes(material)) {
      updated.push(material);
      continue;
    }

    const sourceLang = sourceLanguageOf(`${material.title} ${material.description ?? ''}`);

    if (sourceLang === 'ru') {
      console.log(`  • ${material.title.slice(0, 60)} — уже на русском, пропускаю`);
      updated.push(material);
      skippedCount += 1;
      continue;
    }

    const titleResult = await translateToRussian(material.title, sourceLang, config);
    const descriptionResult = material.description
      ? await translateToRussian(material.description, sourceLang, config)
      : null;

    const title = titleResult.translated ? titleResult.text : material.title;
    const description = descriptionResult?.translated
      ? descriptionResult.text
      : material.description;

    let summary = material.summary;

    // Резюме перегенерируем, только если текст удалось перевести:
    // иначе в нём останется старое упоминание иноязычного заголовка.
    if (titleResult.translated || descriptionResult?.translated) {
      const fresh = await summarize({ ...toRaw(material), title, description }, config);
      const summaryResult = await translateToRussian(fresh, sourceLang, config);
      summary = summaryResult.translated ? summaryResult.text : fresh;
    }

    const next: Material = {
      ...material,
      title,
      description,
      summary,
      translated: titleResult.translated || descriptionResult?.translated === true,
      sourceLang
    };

    if (recategorize) {
      const raw = toRaw(next);
      next.category = categorize(raw);
      next.tags = extractTags(raw);
    }

    updated.push(next);

    if (next.translated) {
      translatedCount += 1;
      console.log(`  ✓ ${material.title.slice(0, 50)} → ${title.slice(0, 50)}`);
    } else {
      failedCount += 1;
      console.log(`  ✗ ${material.title.slice(0, 50)} — перевести не удалось, оставляю оригинал`);
    }
  }

  console.log(
    `\nПереведено: ${translatedCount}, пропущено: ${skippedCount}, без перевода: ${failedCount}`
  );

  if (dryRun) {
    console.log('Режим --dry-run: файл не изменён.');
    return;
  }

  writeFileSync(DATA_FILE, `${JSON.stringify(updated, null, 2)}\n`, 'utf-8');
  console.log(`Записано: ${DATA_FILE}`);
}

main().catch((error: unknown) => {
  console.error(`Докач не выполнен: ${(error as Error).message}`);
  process.exitCode = 1;
});
