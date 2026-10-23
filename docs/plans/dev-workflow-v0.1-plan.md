# dev-workflow v0.1 — план реализации

> **Статус:** ✅ Одобрен пользователем 2026-10-23.
>
> **Остановки:** задачи выполняются подряд. Остановиться и ждать подтверждения: после задачи с пометкой `**Остановка:** да`; при отступлении от плана или открытом вопросе; перед необратимым шагом (коммит, пуш, создание репозитория).

**Цель:** вынести агента `browser-checker`, хук `block-edits-on-main` и скиллы `start-task`, `finish-task`, `pr-description` из `health-monitor/.claude` в обобщённый плагин `dev-workflow` и опубликовать его в публичном маркетплейсе `nickburdo/claude-plugins`.

**Архитектура:** репозиторий-маркетплейс (`.claude-plugin/marketplace.json`) с плагином в `plugins/dev-workflow/`. Проектные настройки читаются из `.claude/dev-workflow.md` (YAML-фронтматтер + заметки) в репозитории проекта.

**Технологии:** формат плагинов Claude Code (`.claude-plugin/plugin.json`, `skills/`, `agents/`, `hooks/hooks.json`, `${CLAUDE_PLUGIN_ROOT}`), Node.js для хука. Новых зависимостей нет.

## Решения пользователя

- **Охват:** обобщить, проектное вынести в конфиг.
- **Конфиг:** файл `.claude/dev-workflow.md` в репозитории проекта.
- **Репозиторий:** маркетплейс `nickburdo/claude-plugins` (имя маркетплейса `nickburdo-plugins`), публичный, локально `C:\Users\nikbu\projects\claude-plugins`.
- **Имя плагина:** `dev-workflow`.
- **Язык:** плагин на английском; язык отчётов/планов/вопросов — поле `language` в конфиге.
- **Хук:** защищает `protectedBranches` из конфига, по умолчанию `main` и `master`.
- **Исходники в health-monitor:** остаются как есть.
- **Одобренные предложения:** лицензия MIT; шаги с роадмапом / done-log / бэклогом опциональны; без конфига скиллы предлагают его создать и останавливаются, хук работает с дефолтами.

## Структура

```
claude-plugins/
├── .claude-plugin/marketplace.json
├── README.md
├── LICENSE
├── docs/plans/dev-workflow-v0.1-plan.md
└── plugins/dev-workflow/
    ├── .claude-plugin/plugin.json
    ├── README.md
    ├── agents/browser-checker.md
    ├── hooks/hooks.json
    ├── hooks/block-edits-on-protected-branch.mjs
    ├── skills/start-task/{SKILL.md, plan-template.md}
    ├── skills/finish-task/SKILL.md
    ├── skills/pr-description/SKILL.md
    └── templates/{dev-workflow.md, dev-workflow.health-monitor.md}
```

---

### Задача 1: Репозиторий

- [x] 1.1. Создать `C:\Users\nikbu\projects\claude-plugins`, `git init` на `main`.
- [x] 1.2. `.claude-plugin/marketplace.json`: имя `nickburdo-plugins`, owner `nickburdo`, плагин `dev-workflow` с source `./plugins/dev-workflow`.
- [x] 1.3. `plugins/dev-workflow/.claude-plugin/plugin.json`: name, version `0.1.0`, description, author, license.

### Задача 2: Схема конфига

- [x] 2.1. `templates/dev-workflow.md`: поля `language`, `mainBranch`, `protectedBranches`, `branchTypes`, `plansDir`, `roadmapFile`, `doneLogFile`, `backlogFile` (последние три опциональны), `checkCommands`, `uiPaths`, `devServer: {command, port}`, `viewportWidths`, `codeReviewLevel`.
- [x] 2.2. Тело шаблона — проектные заметки для browser-checker (темы, CSS-токены, особенности рендера).
- [x] 2.3. `templates/dev-workflow.health-monitor.md` с текущими значениями Health Monitor.

### Задача 3: Хук

**Остановка:** да

- [x] 3.1. Перенести скрипт как `block-edits-on-protected-branch.mjs`.
- [x] 3.2. Читать `protectedBranches` из фронтматтера `.claude/dev-workflow.md` (простой разбор, без зависимостей); по умолчанию `[main, master]`.
- [x] 3.3. Сообщение — на английском и без привязки к `.claude/settings.json`.
- [x] 3.4. `hooks/hooks.json`: `PreToolUse`, matcher `Edit|Write|NotebookEdit`, `node "${CLAUDE_PLUGIN_ROOT}/hooks/block-edits-on-protected-branch.mjs"`.
- [x] 3.5. Ручная проверка: защищённая ветка, обычная ветка, файл вне проекта, игнорируемый файл, конфиг со своим списком веток.

### Задача 4: Скиллы

- [x] 4.1. `start-task`: шаг 0 — прочитать конфиг (нет файла → предложить создать из шаблона и остановиться); пути и язык из конфига; шаги с `roadmapFile`/`doneLogFile`/`backlogFile` только если они заданы.
- [x] 4.2. `plan-template.md`: на английском, заголовки агент переводит на `language`.
- [x] 4.3. `finish-task`: `checkCommands`, `uiPaths`, `codeReviewLevel`, агент `dev-workflow:browser-checker`, пути из конфига.
- [x] 4.4. `pr-description`: `main` → `mainBranch`.

### Задача 5: Агент browser-checker

- [x] 5.1. Убрать упоминания Health Monitor / Nuxt / `.health-*` / порта 3030; брать `devServer`, `viewportWidths`, `language` и заметки из конфига.
- [x] 5.2. Сверить фронтматтер (`tools`, `disallowedTools`, `model`) с ограничениями для агентов плагина; несовместимость — остановка и обсуждение.

### Задача 6: Документация

- [x] 6.1. `plugins/dev-workflow/README.md`: состав, установка, конфиг, зависимости (Playwright MCP, скилл `code-review`, `gh`).
- [x] 6.2. Корневой `README.md`: `/plugin marketplace add nickburdo/claude-plugins`, `/plugin install dev-workflow@nickburdo-plugins`.
- [x] 6.3. `LICENSE` (MIT).

### Задача 7: Проверка

- [x] 7.1. `claude plugin validate` (если доступна), иначе ручная проверка JSON.
- [x] 7.3. Ревью в отдельном субагенте; найденное разобрать с пользователем (7 находок, пользователь решил исправить все — задача 7a).
- [ ] 7.2. Локальная установка маркетплейса пользователем и проверка, что скиллы и агент видны — **после 8.1** (иначе хук плагина заблокирует правки в этом репозитории на `main`).

### Задача 7a: Исправления по ревью (пересмотр плана, одобрен пользователем 2026-10-23)

**Остановка:** да

- [x] 7a.1. Хук всегда разрешает правку `.claude/dev-workflow.md` (иначе start-task не может создать конфиг на `main`).
- [x] 7a.2. Разбор `protectedBranches`: элементы `- x` без отступа, пустые строки и комментарии между ключом и элементами, многострочный `[...]`, BOM.
- [x] 7a.3. Правило об опциональных полях в start-task и finish-task: пропускать только подпункты, работающие с незаданным файлом.
- [x] 7a.4. Хук: молча пропускать только «not a git repository», при прочих ошибках git — предупреждение.
- [x] 7a.5. README, `hooks.json` и шаблон конфига: «все не игнорируемые файлы, включая новые» вместо «tracked».
- [x] 7a.6. pr-description: если `origin/HEAD` не задан — `main`, если есть, иначе спросить.
- [x] 7a.7. Перепроверка: тестовые сценарии хука, `claude plugin validate`, ревью исправлений `low` в субагенте по снапшоту. Находка повторного ревью «flow-список на строке после ключа» отклонена пользователем.

### Задача 8: Публикация

**Остановка:** да (перед выполнением)

- [x] 8.1. Начальный коммит на `main` (до установки плагина в 7.2); `.idea/` добавлена в `.gitignore` по решению пользователя.
- [ ] 8.2. `gh repo create nickburdo/claude-plugins --public --source . --push`.

## Не входит

- Изменения в `health-monitor` (копии остаются, плагин там не подключается).
- Встраивание Playwright MCP в плагин.
