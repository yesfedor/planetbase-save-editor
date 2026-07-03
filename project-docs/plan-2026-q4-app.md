# План 2026-Q4 — Desktop App (Electron)

Цель: превратить веб-редактор в **десктоп-приложение**, которое геймер скачивает одним
файлом и запускает двойным кликом — **без Node.js, nvm, терминала и `npm`**. Опирается на
готовые Q3-части (`project-docs/plan-2026-q3-engine.md`, `plan-2026-q3-web.md`), схему сейва —
`save-schema.md`.

## Что уже есть (переиспользуем)
- `src/core/` — чистое TS-ядро (парсинг/правка/сборка .sav). **Не зависит от HTTP** — можно
  вызывать напрямую из Electron main-процесса.
- `src/web/` — Vue SPA (renderer). Клиент ходит в API через тонкий слой `src/web/src/api.ts`.
- `src/server/` — nitro-мост: `session.ts` (сессия = загруженный `SaveDocument`), `apply.ts`
  (применение команд), роуты `api/**`. Логику команд переиспользуем, транспорт (HTTP) — заменим.

## Ключевая развилка (закрыть до старта)
**Как renderer общается с fs/engine в Electron:**
1. **IPC (рекомендую)** — main-процесс импортирует `core` напрямую, отдаёт команды через
   `ipcMain` + `contextBridge` (`window.api`). Нет localhost-сервера, нет портов, безопаснее,
   легче. Требует вынести команды из nitro-роутов в транспорт-независимый слой.
2. **Встроенный nitro (быстрый MVP)** — main спавнит собранный nitro-сервер на случайном порту,
   окно грузит SPA с `http://localhost:PORT`. Переиспользует 100% сервера, но тащит HTTP-сервер
   внутрь приложения и требует управления портом.

Рекомендация: **вариант 1 (IPC)** как целевой; вариант 2 — запасной для быстрого прототипа.
Идеально: общий «диспетчер команд» на базе `core`, который дергают И nitro-роуты (web), И IPC
(Electron) — один источник логики для обоих способов доставки.

## Целевая структура
```
electron/
  main.ts          # жизненный цикл, окно (BrowserWindow), меню, диалоги
  preload.ts       # contextBridge → window.api (типобезопасный мост)
  ipc.ts           # регистрация ipcMain-хендлеров поверх command-диспетчера
src/core/          # без изменений
src/server/
  commands.ts      # НОВОЕ: транспорт-независимый диспетчер (open/add/remove/...) на core
  api/**           # nitro-роуты становятся тонкими обёртками над commands.ts
src/web/
  src/api.ts       # переключатель транспорта: window.api (Electron) ИЛИ fetch (web)
```

## Зависимости (позже, ставит пользователь)
```
npm i -D electron electron-vite electron-builder
```
(`electron-vite` — сборка main/preload/renderer с HMR; `electron-builder` — установщики.)

## Этапы
- **E0. Тулинг.** electron-vite конфиг (main/preload/renderer = `src/web`), скрипты
  `app:dev` (electron-vite dev), `app:build`. Стоп-поинт: пользователь ставит зависимости.
- **E1. Каркас окна.** `electron/main.ts` создаёт `BrowserWindow`, грузит Vue SPA. Dev — с HMR.
  Проверка: окно открывается, SavePicker рисуется.
- **E2. Command-слой.** Вынести логику из `session.ts`/`apply.ts` в `src/server/commands.ts`
  (транспорт-независимо). nitro-роуты и IPC-хендлеры вызывают одни и те же команды.
- **E3. IPC-мост.** `preload.ts` через `contextBridge` отдаёт `window.api` с теми же методами,
  что и web-`api.ts`. `src/web/src/api.ts` — переключатель: если есть `window.api` → IPC, иначе fetch.
- **E4. Нативная интеграция.** Диалог выбора папки игры (`dialog.showOpenDialog`) вместо ручного
  ввода пути; `settings.json` в `app.getPath('userData')`, а не в корне проекта; авто-детект
  папки игры (переиспользовать `detectGameDir`).
- **E5. Упаковка.** `electron-builder`: Windows-установщик (NSIS) + portable `.exe`. Проверка:
  двойной клик по установленному приложению открывает редактор без терминала.
- **E6. Оформление.** Иконка/название, splash по желанию. README: раздел «Скачать и запустить»
  (скачать `.exe` из Releases → запустить). Consol/web-версии остаются для продвинутых.

## Открытые вопросы (решить по ходу)
1. Транспорт: IPC (рекомендую) или встроенный nitro. → развилка выше.
2. Упаковщик: `electron-builder` (рекомендую) или `electron-forge`.
3. Целевые ОС для установщиков: только Windows или + Linux (AppImage) / macOS (dmg).
4. Авто-обновление (`electron-updater`) — вероятно вне scope v1.
5. Подпись кода (Windows SmartScreen / macOS notarization) — нужен сертификат; для v1 можно без,
   с инструкцией «Всё равно запустить».

## Definition of Done
- Установщик под Windows; двойной клик → рабочий редактор без терминала/Node.
- Нативный выбор папки игры; настройки в userData.
- Web (`npm run web`) и CLI (`npm run cli`) продолжают работать без изменений поведения.
- Отчёт: что изменено, как собрать установщик, известные ограничения (подпись, авто-апдейт).
