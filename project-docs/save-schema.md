# PlanetBase `.sav` — структура (reference)

Общий справочник по формату сохранения. На него ссылаются оба плана (engine, web),
чтобы не дублировать знания о схеме. Данные получены анализом `saves/example.sav`
(старый, ship-only) и `saves/quick1.sav` (застройка 3 уровня, 101 постройка).

## Формат
- XML, корень `<save-game version="N">`. Версия варьируется (`8` в example, выше в quick1).
- Парсер: `fast-xml-parser`, атрибуты с префиксом `@_`, `alwaysCreateTextNode: true`.
- Числа/булевы хранятся строками в атрибуте `value` (`<x value="12" />` → `{ '@_value': '12' }`).
- **Важно:** набор корневых узлов зависит от версии. Движок не должен предполагать наличие
  узла — только проверять и создавать при необходимости.

## Корневые узлы `save-game`
`id-generator, planet, milestones, techs, environment, terrain, camera, sandstorm,
solar-flare, colony, ship-manager, stats, visitor-events, game-hints, meteor-manager,
manufacture-limits, constructions, characters, resources, ships, interactions`

Только в новых сейвах (quick1): `blizzard`, `challenge-manager`, `screenshot`.

### id-generator
```
<id-generator><next-id value="12053"/><next-bot-id value="30"/></id-generator>
```
`next-id` — глобальный счётчик id для новых сущностей/ресурсов. Инкрементим при спавне.

### colony
`extra-prestige, game-time, real-game-time, name (×2 дубль!), latitude, longitude`.
Имя колонии дублируется двумя узлами `<name>` — при переименовании менять оба.

### camera
`height`, `position{x,y,z}`, `orientation{x,y,z}` — точка обзора на момент сохранения.
Используется как альтернативная точка спавна.

### ship-manager > landing-permissions
Настройки колонии: `colonists-allowed, merchants-allowed, visitors-allowed` +
процент специализаций `Worker/Biologist/Engineer/Medic/Guard-percentage`.

## Персонажи — `characters > character[]`
Плоский массив, тип в `@_type` (`Colonist` | `Bot`). В quick1: 22 Colonist + 30 Bot.
Есть `position{x,y,z}` и `orientation` → рисуются на карте.

Поля Colonist: `position, orientation, location, name, specialization (×2 дубль),
status-flags, state, id, wander-time, Health, Nutrition, Hydration, Oxygen, Sleep,
Morale, Gendre (ВНИМАНИЕ: игровой тег `Gendre`, не `gender`), basic-meal-count,
head-index, skin-color-index, hair-color-index, doctor, inmunity-to-contagion-time`.

Поля Bot: `status-flags, wander-time, integrity-decay-rate, id, position, orientation,
location, name, specialization, state, Condition, Integrity`.
Специализации ботов: `Constructor` (CNT-), `Carrier` (CR-), `Driller` (DR-).
Специализации колонистов: `Worker, Biologist, Engineer, Medic, Guard`.

## Постройки — `constructions > construction[]`
В quick1: 101 шт = 46 `Module` + 55 `Connection` (тип в `@_type`).
Module: `enabled(×2), state, build-progress, condition, oxygen, id, position, orientation,
time-built, locked, high-priority, module-type, size-index`.

Типы модулей (`module-type.value`), встреченные в quick1 (20 типов):
`ModuleTypeOxygenGenerator, Airlock, PowerCollector, WaterExtractor, SolarPanel, Storage,
Canteen, Dorm, BioDome, WindTurbine, Mine, ProcessingPlant, Lab, MultiDome, SickBay,
Factory, WaterTank, RoboticsFacility, Bar, ControlCenter`.

## Ресурсы — ТРИ независимых контейнера
Типы ресурсов: `Metal, Bioplastic, Meal, AlcoholicDrink, MedicalSupplies, Gun, Starch,
MedicinalPlants, Ore, Spares, Semiconductors, Vegetables, Vitromeat`.

Узел ресурса (общая форма):
```
<resource type="Metal">
  <id value="59"/> <trader-id value="-1"/>
  <position x.. y.. z../> <orientation .../>
  <state value="3"/> <location value="1"/>
  <subtype value="0"/> <condition value="1"/> <durability value="1"/>
</resource>
```

1. **Земля/поле** — `save-game > resources > resource[]`.
   Свободно лежащие ресурсы (`location=1` на земле, `location=0` встречается). Без лимита.
   Также здесь `inmaterial-resources` (нематериальное: деньги/coins — в примерах пусто).

2. **Корабль** — `save-game > ships > ship > resource-container > { capacity, resource[] }`.
   Есть `capacity` (лимит). Текущий редактор пихает сюда и раздувает capacity.

3. **Склад (Storage-модуль)** — `construction[module-type=ModuleTypeStorage] >
   resource-storage > slot[]`. Слотовая модель:
   ```
   <slot>
     <position x.. y.. z../> <max-height value=".."/>
     <resource .../>   <!-- опционально: занятый слот -->
   </slot>
   ```
   - Один слот = один ресурс. Пустой слот — без дочернего `<resource>`.
   - **ЛИМИТ склада = число слотов** (зависит от `size-index`; size-3 ≈ 50 слотов).
   - Чтобы добавить ресурс на склад: найти пустой слот и вставить `<resource>` с
     `position` = позиция слота, `location=0`, `state=2`. Заполнять ДО числа свободных слотов.
   - `max-height` слота — визуальная высота стопки, для инъекции можно не трогать.

## Прочее
- `stats > counter[32]` — счётчики (тип в `@_type`), поле `counts` строкой. Не трогаем.
- `manufacture-limits` — лимиты производства (`bot-limit`, `*-limit`).
- `screenshot` (новые сейвы) — вероятно превью-картинка; потенциально для web-превью сейва.
- `interactions`, `milestones`, `techs`, `game-hints` — часто пустые (`#text`).

## Известные баги текущего редактора (old/)
- Пишет `gender`, игра ждёт `Gendre`.
- `resourcesRemoveAllByType` читает `resources.resource` — падает на ship-only сейвах (example).
- `techs.lib.js` сломан (`payload.type` undefined).
- Дублирующийся `specialization`/`name` игрой допускается, но лучше не плодить.
- `onSaveResources` для cameraPosition имеет битую guard-логику (обращение до создания узла).
