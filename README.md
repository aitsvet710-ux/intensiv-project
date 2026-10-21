# Daidgest

[![CI](https://github.com/aitsvet710-ux/intensiv-project/actions/workflows/ci.yml/badge.svg)](https://github.com/aitsvet710-ux/intensiv-project/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Last commit](https://img.shields.io/github/last-commit/aitsvet710-ux/intensiv-project)](https://github.com/aitsvet710-ux/intensiv-project/commits/main)

Репозиторий интенсива. Проект — **Daidgest**.

## О проекте

Рабочее пространство сессии: сюда попадает код, который пишется в рамках интенсива,
и всё, что помогает вести разработку единообразно — CI, шаблоны issues и pull request,
линтеры и правила оформления коммитов.

## Структура

```text
.
├── .github/            # CI, шаблоны PR и issues, dependabot
├── .editorconfig       # Единые правила форматирования
├── .gitattributes      # Нормализация переводов строк
├── .gitignore          # Исключения из индекса
├── .markdownlint.json  # Правила линтера Markdown
├── .yamllint           # Правила линтера YAML
├── CONTRIBUTING.md     # Как Contributing
├── CODEOWNERS          # Владельцы кода
├── LICENSE             # MIT
├── README.md
└── SECURITY.md         # Политика безопасности
```

## Быстрый старт

```bash
git clone https://github.com/aitsvet710-ux/intensiv-project.git
cd intensiv-project
git checkout -b feat/my-feature
```

## Рабочий процесс

1. Ветка от `main` с префиксом `feat/`, `fix/`, `docs/` или `chore/`.
2. Коммит в стиле Conventional Commits: `feat:`, `fix:`, `docs:`, `chore:`.
3. Push ветки и Pull Request на GitHub.
4. Зелёный CI — условие для merge.

Подробности — в [CONTRIBUTING.md](CONTRIBUTING.md).

## CI

Workflow `.github/workflows/ci.yml` запускается на каждый push в `main` и на каждый
pull request. Проверяет:

- Markdown через `markdownlint-cli2`,
- YAML через `yaml-lint`,
- пробельные ошибки и маркеры конфликтов через `git diff --check`,
- наличие обязательных файлов репозитория.

Локальный запуск тех же проверок:

```bash
npx --yes markdownlint-cli2 "**/*.md" "#node_modules"
find .github -name '*.yml' -print0 | xargs -0 npx --yes yaml-lint
git diff --check
```

## Безопасность

- 2FA включена на аккаунте владельца.
- Токены доступа имеют минимальные scope.
- Ветка `main` защищена: прямые push'и и force-push запрещены.
- Работает автоматическое сканирование секретов и обновление зависимостей.

Подробности — в [SECURITY.md](SECURITY.md).

## Лицензия

[MIT](LICENSE)
