# AGENTS.md — Daidgest Digest

Документ описывает, как настроить, запустить и расширить сайт-дайджест по столярному ремеслу,
деревообработке и работе с деревом.

## 1. Технический стек

- **[Astro](https://astro.build/)** — статический сайт (static-first), минимальный JS
- **[Tailwind CSS](https://tailwindcss.com/)** — стилизация
- **TypeScript** — типизация
- **Node.js 18+ / 20+** — для сборки и скриптов
- **GitHub Pages** — хостинг

## 2. Установка и запуск

```bash
# Установка зависимостей
npm install

# Режим разработки
npm run dev

# Сборка
npm run build

# Предпросмотр собранного сайта
npm run preview

# Сбор материалов из источников
npm run collect
```

## 3. Структура проекта

```text
.
├── .github/workflows/deploy.yml  # Деплой на GitHub Pages
├── data/materials.json          # Собранные и обработанные материалы
├── public/                      # Статичные файлы
├── scripts/
│   ├── adapters/                # telegram.ts, rss.ts, youtube.ts
│   ├── ai/summarize.ts          # AI-резюме + fallback
│   ├── collect.ts               # Главный скрипт сбора
│   ├── categorize.ts            # Категоризация
│   ├── filter.ts                # Фильтрация
│   └── normalize.ts             # Нормализация
├── src/
│   ├── components/              # UI-компоненты
│   ├── config/                  # Конфиги (sources, ai, site)
│   ├── layouts/                 # Лейауты
│   ├── lib/                     # Типы, утилиты, процессор
│   ├── pages/                   # Страницы Astro
│   └── styles/global.css        # Глобальные стили
└── AGENTS.md
```

## 4. Конфигурация

### 4.1. Источники — `src/config/sources.json`

```json
{
  "telegram": [
    { "name": "@stolyarka_vmeste", "enabled": true, "notes": "..." }
  ],
  "rss": [
    { "name": "Example Blog", "url": "https://example.com/feed.xml", "enabled": false }
  ],
  "youtube": []
}
```

**Как добавить новый источник:**

1. Добавьте запись в соответствующий раздел (`telegram`, `rss`, `youtube`) с `enabled: true`
2. Для RSS обязательно укажите рабочий `url` (Atom/RSS)
3. Для Telegram — название канала без `https://t.me/` или с `@`
4. Запустите `npm run collect` для проверки

### 4.2. Настройки сайта — `src/config/site.json`

```json
{
  "title": "Daidgest",
  "description": "...",
  "vkUrl": "https://vk.com/your_community_link"
}
```

Ссылка на ВК берётся отсюда и отображается в шапке и подвале. Замените `vkUrl` на актуальную ссылку.

### 4.3. AI-резюме — `src/config/ai.json` и `.env`

Конфиг:

```json
{
  "enabled": true,
  "provider": "openrouter",
  "model": "google/gemini-2.5-flash-preview-05-20",
  "maxTokens": 256,
  "temperature": 0.4,
  "prompt": "..."
}
```

Переменные окружения (никогда не коммитить реальные ключи):

```env
OPENROUTER_API_KEY=sk-or-v1-...
# или
LLM_API_KEY=...
```

Файл `.env.example` содержит шаблон. При отсутствии ключа или ошибке AI автоматически используется
эвристическое резюме (fallback) — `npm run collect` не упадёт.

Провайдер выбирается полем `provider`:

- `openrouter` — `https://openrouter.ai/api/v1/chat/completions`
- `openai` — `https://api.openai.com/v1/chat/completions`

Оба API совместимы с форматом OpenAI, поэтому промпт и модель настраиваются одинаково.

## 5. MCP для Telegram/RSS

Для унифицированного сбора рекомендуется использовать MCP-серверы. Основной код не жёстко привязан
к конкретному MCP — адаптеры находятся в `scripts/adapters/` и легко заменяются.

### Рекомендуемый вариант

- [`@goldjee/news-digest-mcp`](https://www.npmjs.com/package/@goldjee/news-digest-mcp) — агрегатор
  новостных и RSS-источников. Конфигурируется через переменные окружения.

### Как подключить через opencode.json

Создайте или отредактируйте `opencode.json` в корне проекта:

```json
{
  "mcp": {
    "servers": {
      "news-digest": {
        "command": "npx",
        "args": ["-y", "@goldjee/news-digest-mcp"],
        "env": {
          "TELEGRAM_API_ID": "${TELEGRAM_API_ID}",
          "TELEGRAM_API_HASH": "${TELEGRAM_API_HASH}",
          "TELEGRAM_SESSION": "${TELEGRAM_SESSION}"
        }
      }
    }
  }
}
```

### Настройка Telegram

Если нужно прямое чтение закрытых каналов через Telegram Client API:

1. Получите `api_id` и `api_hash` на [my.telegram.org](https://my.telegram.org)
2. Сохраните их в `.env` (см. `.env.example`)
3. При первом запуске потребуется интерактивная авторизация — код из SMS или из приложения
4. **Никогда не коммитьте токены, сессии или ключи.** Используйте `.env`

Без `TELEGRAM_SESSION` скрипт читает публичную ленту `t.me/s/<канал>` — авторизация не нужна,
но доступны только открытые каналы.

### Альтернативы

- Любой RSS-агрегатор через `fetch` и `rss-parser`
- Собственный адаптер в `scripts/adapters/` — добавьте файл, реализуйте сборщик материалов
  и подключите его в `scripts/collect.ts`

**Принцип:** `src/lib/` и `src/pages/` не знают про MCP. Вся работа с внешними источниками
инкапсулирована в `scripts/`.

## 6. Деплой на GitHub Pages

В репозитории уже настроен workflow `.github/workflows/deploy.yml`.

**Порядок настройки:**

1. Перейдите в Settings → Pages → Build and deployment: выберите **GitHub Actions**
2. Закоммитьте и запушьте изменения в `main`
3. Workflow автоматически соберёт и задеплоит сайт
4. URL вида: `https://<username>.github.io/<repo-name>/`

В `astro.config.mjs` указаны `site` и `base`. При смене имени репозитория поправьте `base`.

## 7. Расширение проекта

### Добавить новый источник

См. раздел 4.1. Минимально — добавить в `sources.json` и при необходимости адаптер.

### Добавить новую рубрику

1. Добавьте значение в union `Category` в `src/lib/types.ts`
2. Добавьте ключевые слова в `scripts/categorize.ts`
3. Добавьте метку и цвет в `src/components/Tag.astro`

### Заменить источник данных

Данные сайта берутся только из `data/materials.json`. Чтобы заменить источник (например, с Telegram
на другой мессенджер), достаточно переписать `scripts/collect.ts` и/или добавить адаптеры.
UI и страницы при этом не трогаем.

## 8. Советы по разработке

- Держите `data/materials.json` в репозитории — упрощает деплой на GitHub Pages
- Тестируйте сбор на 1–2 источниках перед расширением
- При отладке AI можно временно выставить `ai.enabled: false` в конфиге
- Коммитьте `.env.example`, но **никогда** `.env`
- Следите за лимитами OpenRouter при массовом сборе
- Фильтрация и категоризация работают и с русским, и с английским текстом
