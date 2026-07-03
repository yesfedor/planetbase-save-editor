# План 2026-Q3 — Engine (переписывание ядра)

> **Статус: ГОТОВО (2026-07-03).** Ядро `src/core/` + CLI `src/cli.ts` реализованы,
> типы чистые (`npm run typecheck`), round-trip и запись на диск проверены на
> `example.sav` и `quick1.sav`. `old/` удалён пользователем. Детали — в отчёте DoD внизу.

Цель: вынести из «свалки» `src/` чистое, расширяемое, типизированное **ядро** без UI,
и построить CLI поверх него. Web (см. [plan-2026-q3-web.md](./plan-2026-q3-web.md)) потом
использует то же ядро. Схема сейва — в [save-schema.md](./save-schema.md).

Решения (согласовано):
- Стек ядра: **TypeScript (ESM)**, запуск через `ts-node`.
- Структура: плоско — `core/` + `cli.ts` + `server.ts` + `web/` (web в отдельном плане).
- Текущий `src/` → `old/`, `app.js` → `old/app.js` (эталон, не удаляем).
- Сохранение сейва: **выбор в UI** (новый файл `*_modified*.sav` ИЛИ перезапись + `.bak`).
- Баги чиним по ходу, каждый фикс — в отчёте.
- `npm i` выполняет пользователь (список ниже).

## Зависимости (отдать пользователю на `npm i`)
Прод: оставить `fast-xml-parser`. **Убрать `lodash`** → `structuredClone` (Node 22).
```
npm i -D typescript ts-node @types/node
npm i @clack/prompts            # современный CLI вместо readline-sync
npm rm lodash readline-sync     # после переноса
```
(`three`, `nitropack`, `vue`, `vite` — later, в web-плане.)

## Целевая структура
```
core/
  index.ts                 # публичный API (фасад)
  xml/codec.ts             # XMLParser/XMLBuilder + parse()/build() (string <-> model)
  types/save.ts            # интерфейсы модели save-game (узлы, @_атрибуты)
  types/domain.ts          # enum'ы: ResourceType, ColonistSpec, BotSpec, ModuleType
  dictionaries/            # словари типов (из old/src/lib, починенные)
    resources.ts colonists.ts bots.ts modules.ts
  save/
    SaveDocument.ts        # обёртка над распарсенной моделью: геттеры разделов, toXml()
    SaveRepository.ts      # fs: список .sav, load(path), save(doc, strategy) + .bak
  services/
    ids.ts                 # getNextId/allocId(count), nextBotId
    spawn.ts               # resolveSpawnPoint(doc, source) -> {position, orientation, sink}
    resources.ts           # list/add/removeByType/bulk + 3 контейнера (ground/ship/storage)
    storage.ts             # склады: перечислить Storage-модули, свободные слоты, заполнить
    colonists.ts           # list/add/edit/rename/remove
    bots.ts                # list/add/edit/rename/remove
    colony.ts              # rename, landing-permissions, базовые настройки
cli.ts                     # точка входа CLI (ts-node) — тонкий UI поверх core
cli/                       # экраны меню (@clack/prompts), без бизнес-логики
old/                       # архив текущей реализации (эталон)
```
Принципы: файлы < 400 строк; ядро без `console`/`process.exit`/промптов; сервисы —
чистые функции над моделью (мутируют переданный документ, возвращают результат/счётчики).

## Этапы

### Э0. Заморозка и каркас
1. `src/` → `old/`, `app.js` → `old/app.js`. Проверить `node old/app.js` ещё работает.
2. `package.json`: `type: module`, скрипты `cli` (`ts-node cli.ts`), `dev:cli`. `tsconfig.json`
   (ESM, `module: NodeNext`, `strict`). **Стоп-поинт: пользователь делает `npm i`.**

### Э1. XML codec + типы + словари
3. `core/xml/codec.ts` — единая конфигурация парсера/билдера (из `old/src/boot.js`).
4. `core/types/*` — интерфейсы модели (по [save-schema.md](./save-schema.md)); толерантность
   к отсутствующим узлам и к массив-или-один (fast-xml-parser отдаёт объект при 1 элементе).
5. `core/dictionaries/*` — перенести словари, **починить `techs`/удалить**, добавить modules.

### Э2. SaveDocument + SaveRepository
6. `SaveDocument` — load из строки, нормализация (гарантировать массивы для
   `characters.character`, `resources.resource` и т.д.), разделы-геттеры, `toXml()`.
7. `SaveRepository` — `listSaves(dir)`, `load(path)`, `save(doc, { strategy })`:
   - `strategy: 'new-file'` → `*_modified*.sav` рядом (как сейчас);
   - `strategy: 'overwrite'` → перезапись оригинала, предварительно `.bak`.

### Э3. Доменные сервисы (ядро возможностей)
8. `ids.ts` — `allocId(doc, n)` возвращает диапазон и двигает `next-id`.
9. `spawn.ts` — `resolveSpawnPoint(doc, source)` для `source ∈ {colonyShip, camera,
   coords, storage}`; возвращает позицию/ориентацию и «sink» (куда класть). Убрать readline.
10. `resources.ts` — унифицировать 3 контейнера:
    - ground (`resources.resource`), ship (`ships.ship.resource-container`),
    - storage (делегирует в `storage.ts`);
    - `add(type, count, target)`, `removeAllByType(type, scope)`, `list()/counts()`.
    - Починить падение на ship-only сейвах (нет `resources.resource`).
11. `storage.ts` — `listStorages(doc)`, `freeSlots(storage)`,
    `fillStorage(storage, type, count)` (до числа свободных слотов; вернуть сколько влезло).
12. `colonists.ts` / `bots.ts` — `add(spec, count, spawn)`, `edit(id, patch)`,
    `rename(id, name)`, `remove(id)`, `list()`. Писать `Gendre` (не `gender`).
13. `colony.ts` — `rename(name)` (оба узла), `getSettings()/setSettings()` (landing-permissions).

### Э4. CLI поверх ядра
14. `cli.ts` + `cli/` на `@clack/prompts`: выбор файла → операция → сервис core.
    Паритет со старым + новое: remove без падения, выбор стратегии сохранения,
    edit/rename/remove для колонистов/ботов, спавн ресурсов на склад.
15. Удалить `old/`-зависимости из рантайма (остаётся только как эталон), `npm rm lodash readline-sync`.

### Э5. Проверка
16. Round-trip тест: `load(example.sav)` → мутации → `toXml()` → повторный parse без потерь
    структуры; то же для `quick1.sav` (склады, blizzard/challenge-manager не теряются).
17. Ручной прогон CLI по каждому сценарию. Отчёт (DoD): изменённые файлы, фиксы багов,
    допущения, риски.

## Публичный API ядра (эскиз, для web)
```ts
class SaveEditor {
  static fromXml(xml: string): SaveEditor
  toXml(): string
  colonists: ColonistService
  bots: BotService
  resources: ResourceService   // + storage placement
  colony: ColonyService
  map(): MapSnapshot           // все объекты с position/orientation/type — для 3D
}
```
`map()` — сразу закладываем под web-3D: единый снимок объектов (модули, персонажи,
ресурсы) с координатами и типом.

## Риски / открытые вопросы
- Толерантность к версиям сейва (набор узлов разный) — покрываем нормализацией.
- Деньги (coins/inmaterial-resources) в примерах пустые — механика денег отложена до сейва
  с ненулевым балансом.
- `@clack/prompts` требует `npm i` — до установки CLI не запустится (ядро тестируется отдельно).
