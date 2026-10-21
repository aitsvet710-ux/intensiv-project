# Contributing

Спасибо за интерес к проекту. Ниже — короткий гайд по рабочему процессу.

## Быстрый старт

```bash
git clone https://github.com/aitsvet710-ux/intensiv-project.git
cd intensiv-project
git checkout -b feat/my-feature
```

## Ветки и коммиты

- Основная ветка — `main`. В неё не коммитим напрямую.
- Имена веток: `feat/...`, `fix/...`, `docs/...`, `chore/...`.
- Сообщения коммитов в стиле Conventional Commits:

```text
feat: добавить парсер конфигурации
fix: исправить расчёт кэша
docs: обновить README
chore: обновить зависимости
```

## Pull request

1. Создайте ветку от `main`.
2. Внесите изменения, закоммитьте, запушьте: `git push -u origin feat/my-feature`.
3. Откройте Pull Request на GitHub и опишите, что изменилось.
4. Дождитесь зелёного CI — статус появится внизу PR.

Шаблон описания лежит в `.github/PULL_REQUEST_TEMPLATE.md`.

## Локальная проверка перед пушем

```bash
git diff --check
npx --yes markdownlint-cli2 "**/*.md" "#node_modules"
```

## Структура

```text
.
├── .github/            # CI, шаблоны PR и issues, dependabot
├── .editorconfig       # Единые правила форматирования
├── .gitattributes      # Нормализация переводов строк
├── .gitignore          # Исключения из индекса
├── .markdownlint.json  # Правила линтера Markdown
├── .yamllint           # Правила линтера YAML
├── CONTRIBUTING.md
├── CODEOWNERS
├── LICENSE
├── README.md
└── SECURITY.md
```

## Кодекс поведения

Ожидается уважительный и конструктивный тон в issues и pull request'ах.
