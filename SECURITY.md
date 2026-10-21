# Security Policy

## Supported versions

| Version | Supported |
| ------- | --------- |
| main    | Yes       |

## Reporting a vulnerability

Не публикуйте уязвимости в открытых issues. Сообщите приватно через
GitHub Security Advisories: https://github.com/aitsvet710-ux/intensiv-project/security/advisories/new

Опишите:

- что не так и почему это важно,
- шаги для воспроизведения,
- предлагаемое исправление, если есть.

Ответ ожидается в течение 7 дней.

## Что уже включено

- Двухфакторная аутентификация включена на аккаунте владельца.
- Токены доступа выдаются с минимальными scope.
- Ветка `main` защищена: прямые push'и и force-push запрещены.
- Включено автоматическое сканирование секретов и обновление зависимостей.
