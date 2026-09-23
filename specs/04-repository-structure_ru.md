# 4. Структура репозитория

> Часть технического задания — оглавление в [SPEC_ru.md](../SPEC_ru.md).
> Английская версия — [04-repository-structure.md](04-repository-structure.md), обе должны оставаться синхронными.

```
swedish/
├─ .github/
│  └─ workflows/
│     ├─ deploy.yml              # сборка + деплой на GitHub Pages
│     └─ validate.yml            # typecheck, lint, валидация контента, тесты
├─ public/
│  ├─ .nojekyll                  # чтобы Pages отдавал папки, начинающиеся с _
│  ├─ favicon.svg
│  ├─ manifest.webmanifest       # PWA
│  └─ img/
│     ├─ ornament/               # далекарлийская лошадка, курбитс, руны, змеиная лента (§11.4)
│     ├─ history/                # иллюстрации исторических карточек
│     └─ city/                   # иллюстрации зданий (лучше SVG)
│        ├─ tribe/
│        ├─ viking/
│        ├─ medieval/
│        ├─ empire/
│        ├─ industrial/
│        ├─ modern/
│        ├─ green/
│        ├─ connected/
│        ├─ floating/
│        └─ stellar/
├─ content/                      # ── ВЕСЬ УЧЕБНЫЙ КОНТЕНТ ЗДЕСЬ ──
│  ├─ tracks.json                # определения треков и уровней (SFI, SVA grundläggande)
│  ├─ curricula/                 # упорядоченные плейлисты из id уроков
│  │  ├─ sfi-a.json
│  │  ├─ sfi-b.json
│  │  ├─ sfi-c.json
│  │  └─ sfi-d.json
│  ├─ lessons/
│  │  ├─ sfi-a/                  # имя папки == id уровня == префикс id урока
│  │  │  ├─ greetings/
│  │  │  │  ├─ lesson.json       # метаданные
│  │  │  │  ├─ theory.md         # короткая теория на английском (необязательно)
│  │  │  │  ├─ vocab.json        # список слов (необязательно)
│  │  │  │  └─ questions.json    # ручной пул + конфиг генераторов
│  │  │  ├─ alphabet/
│  │  │  ├─ numbers-0-20/
│  │  │  └─ personal-info/
│  │  ├─ sfi-b/
│  │  ├─ sfi-c/
│  │  └─ ...
│  ├─ reference/                 # обзорные статьи о языке — не уроки (см. REFERENCE_ru.md)
│  │  ├─ index.json              # slug → группа и порядок в списке статей
│  │  ├─ verb-groups.md          # английский — канонический …
│  │  ├─ verb-groups_ru.md       # … файл _ru рядом с ним — перевод
│  │  ├─ word-order.md
│  │  └─ noun-genders.md
│  ├─ dialogues/                 # бытовые сценки (см. DIALOGUES_ru.md) — без теста и без XP
│  │  ├─ laundry-room.json
│  │  ├─ cleaning-day.json
│  │  └─ developers-deadline.json
│  ├─ history/                   # исторические карточки (см. §12.4) — без теста, открываются зданиями
│  │  ├─ birka.json
│  │  ├─ runstenar.json
│  │  ├─ birger-jarl-1252.json
│  │  ├─ vasa-1628.json
│  │  └─ tunnelbanan.json
│  └─ city/
│     ├─ eras.json               # 10 эпох Стокгольма (6 исторических + 4 гипотетические)
│     └─ buildings.json          # здания, бонусы, зависимости, позиции на карте
├─ src/
│  ├─ main.tsx
│  ├─ App.tsx
│  ├─ routes.tsx
│  ├─ content/                   # слой загрузки и индексации контента
│  │  ├─ schema.ts               # Zod-схемы + выведенные TS-типы
│  │  ├─ loader.ts               # import.meta.glob → типизированный реестр
│  │  ├─ registry.ts             # хелперы поиска (byId, byLevel, byTrack, search)
│  │  └─ generators.ts           # словарь → автогенерация вопросов
│  ├─ quiz/
│  │  ├─ engine.ts               # выбор вопросов, подсчёт очков, машина состояний сессии
│  │  ├─ selection.ts            # взвешенная выборка из пула с учётом SRS
│  │  ├─ grading.ts              # проверка ответа для каждого типа вопроса
│  │  └─ prng.ts                 # детерминированный ГПСЧ с сидом (mulberry32)
│  ├─ srs/
│  │  └─ scheduler.ts            # планировщик повторений (Лейтнер / упрощённый SM-2)
│  ├─ city/
│  │  └─ economy.ts              # ВСЕ цены, потолки уровней, пороги XP эпох, ставки наград
│  ├─ store/
│  │  ├─ progress.ts             # пройденные уроки, история вопросов, серия дней
│  │  ├─ wallet.ts               # XP, монеты, уровень
│  │  ├─ city.ts                 # купленные здания, текущая эпоха, бонусы
│  │  ├─ settings.ts             # язык интерфейса, тема, голос TTS, звук
│  │  └─ persist.ts              # версионированная схема сейва + миграции + экспорт/импорт
│  ├─ components/
│  │  ├─ layout/                 # AppShell, Nav, Footer
│  │  ├─ lesson/                 # TheoryView, VocabTable, WordCard, AudioButton
│  │  ├─ quiz/                   # QuizRunner + по компоненту на тип вопроса
│  │  ├─ city/                   # CityMap, BuildingCard, EraTimeline, ShopDialog
│  │  └─ ui/                     # Button, Card, Dialog, ProgressBar, Toast, Confetti
│  ├─ pages/
│  │  ├─ HomePage.tsx
│  │  ├─ TracksPage.tsx
│  │  ├─ LevelPage.tsx
│  │  ├─ LessonPage.tsx
│  │  ├─ QuizPage.tsx
│  │  ├─ ResultPage.tsx
│  │  ├─ ReviewPage.tsx          # общая сессия повторения по всем урокам
│  │  ├─ CityPage.tsx
│  │  ├─ ReferencePage.tsx       # хаб: обзоры / банк слов / диалоги
│  │  ├─ StatsPage.tsx
│  │  └─ SettingsPage.tsx
│  ├─ i18n/
│  │  ├─ index.ts
│  │  └─ locales/{ru,en}.json
│  ├─ lib/
│  │  ├─ tts.ts                  # обёртка speechSynthesis с выбором голоса sv-SE
│  │  ├─ format.ts
│  │  └─ shuffle.ts
│  └─ styles/index.css
├─ scripts/
│  ├─ validate-content.ts        # Zod-валидация всех файлов контента, используется в CI
│  ├─ new-lesson.ts              # генератор папки урока по шаблону
│  └─ content-stats.ts           # отчёт: размеры пулов, отсутствующие переводы
├─ tests/
│  ├─ quiz-engine.test.ts
│  ├─ selection.test.ts
│  ├─ grading.test.ts
│  ├─ generators.test.ts
│  ├─ economy.test.ts            # кривая цен и XP остаётся в заданном коридоре
│  └─ content.test.ts            # каждый файл контента проходит свою схему
├─ index.html
├─ vite.config.ts
├─ tailwind.config.ts
├─ tsconfig.json
├─ package.json
├─ SPEC.md
├─ SPEC_ru.md
└─ README.md
```

## Один урок — один уровень, а плейлисты сверху

Урок — это **единица контента**, принадлежащая ровно одному уровню: имя папки, `id`
(`sfi-a/greetings`) и единственный элемент в его `levels` говорят одно и то же. Это
проверяет `scripts/validate-content.ts`, так что урок не может разъехаться со своей папкой.

Учебный курс — это **упорядоченный плейлист из id уроков**: `content/curricula/sfi-a.json`
задаёт порядок прохождения внутри уровня. Плейлист может ссылаться на любой id урока, так что
будущий повторительный набор соберётся из нескольких уровней без дублирования контента.

## Справочные материалы — не курс

`content/reference/` и `content/dialogues/` держат то, что не помещается в лестницу
пятиминутных уроков: обзоры системы целиком (группы глаголов, все склонения существительных,
части речи), сгенерированный банк слов — вся лексика приложения во всех формах — и бытовые
диалоги. Ничего из этого не оценивается, не закрывается замком и не привязано к уровню. План
обеих частей лежит в [REFERENCE_ru.md](REFERENCE_ru.md) и [DIALOGUES_ru.md](DIALOGUES_ru.md); в
интерфейс весь раздел входит одним пунктом навигации с тремя вкладками — глубина без лишнего
хрома.
