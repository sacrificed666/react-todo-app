# 🧭 Decisions

Short architecture decision records. Each one explains the context, the choice and what it costs, so future changes can revisit a decision deliberately instead of by accident.

| #                                                                    | Decision                                            | Status      |
| -------------------------------------------------------------------- | --------------------------------------------------- | ----------- |
| [ADR-1](#adr-1--feature-based-folders-with-enforced-layers)          | Feature-based folders with enforced layers          | ✅ Accepted |
| [ADR-2](#adr-2--undo-and-redo-as-a-history-reducer)                  | Undo and redo as a history reducer                  | ✅ Accepted |
| [ADR-3](#adr-3--native-dialog-and-popover)                           | Native `<dialog>` and popover instead of a UI kit   | ✅ Accepted |
| [ADR-4](#adr-4--a-small-typed-i18n-layer)                            | A small typed i18n layer instead of a library       | ✅ Accepted |
| [ADR-5](#adr-5--strict-csp-with-trusted-types)                       | Strict CSP with Trusted Types                       | ✅ Accepted |
| [ADR-6](#adr-6--the-oxc-toolchain-and-typescript-7)                  | The Oxc toolchain and TypeScript 7                  | ✅ Accepted |
| [ADR-7](#adr-7--local-first-without-a-backend)                       | Local-first without a backend                       | ✅ Accepted |
| [ADR-8](#adr-8--effects-levels-instead-of-one-look-for-every-device) | Effects levels instead of one look for every device | ✅ Accepted |
| [ADR-9](#adr-9--grouped-rows-and-an-inspector-column)                | Grouped rows and an inspector column                | ✅ Accepted |
| [ADR-10](#adr-10--self-hosted-montserrat)                            | Self-hosted Montserrat                              | ✅ Accepted |
| [ADR-11](#adr-11--lazy-translations-and-remote-flags)                | Lazy translations and remote flags                  | ✅ Accepted |
| [ADR-12](#adr-12--repeating-tasks-as-new-occurrences)                | Repeating tasks as new occurrences                  | ✅ Accepted |
| [ADR-13](#adr-13--stay-in-the-list-after-adding)                     | Stay in the list after adding                       | ✅ Accepted |

---

## ADR-1 · Feature-based folders with enforced layers

**🧩 Context.** The first versions grouped files by kind (`components/`, `hooks/`, `lib/`, `store/`). Every new feature touched five folders, and nothing stopped a reusable button from importing the store.

**✅ Decision.** Group code by feature in four layers — `app`, `widgets`, `features`, `shared` — and enforce the allowed directions with Oxlint's `no-restricted-imports` overrides. Features own a `model/` and a `ui/` folder; `shared` never imports from the layers above.

**⚖️ Consequences.**

- 👍 A feature can be read, changed or removed in one place; boundaries are checked on every lint run.
- 👍 Shared primitives stay store-agnostic and easy to test.
- 👎 Cross-feature compositions (the command palette, the actions menu) need care to avoid cycles; `import/no-cycle` guards against them.

## ADR-2 · Undo and redo as a history reducer

**🧩 Context.** Version 2 could only undo deletions, by keeping the removed todos inside the notification. Users expect ⌘Z to undo anything.

**✅ Decision.** Wrap the root reducer in `withHistory()`, which stores the previous `todos` slice and a translatable description whenever an action changes it. `undone` and `redone` swap snapshots. Cross-tab replacements clear the history.

**⚖️ Consequences.**

- 👍 Every present and future action is undoable without per-action inverse logic.
- 👍 Immer's structural sharing keeps 50 snapshots cheap.
- 👎 Only the `todos` slice is undoable — view and settings changes are intentionally not part of the history.

## ADR-3 · Native dialog and popover

**🧩 Context.** Menus, the details sheet and the command palette need focus trapping, <kbd>Esc</kbd> handling, top-layer rendering and light dismiss.

**✅ Decision.** Use the platform: `<dialog popover>` with CSS anchor positioning for menus and `<dialog>` with `showModal()` and `closedby="any"` for modal surfaces, wrapped in the small `Popover` and `Dialog` components.

**⚖️ Consequences.**

- 👍 No UI library, correct focus behaviour and accessibility semantics for free, smaller bundle.
- 👍 Entry and exit animations work with `@starting-style` and `allow-discrete` transitions.
- 👎 jsdom implements neither API, so tests ship small polyfills in `src/test/`.

## ADR-4 · A small typed i18n layer

**🧩 Context.** The app needed English and Ukrainian with correct plurals, dates and typography, but only a few hundred strings and no remote loading.

**✅ Decision.** Keep messages in typed TypeScript objects (`en.ts` defines the keys, `uk.ts` must match them) and build `translate()` on `Intl.PluralRules`, `Intl.DateTimeFormat` and `Intl.RelativeTimeFormat`. Store notifications as keys with parameters.

**⚖️ Consequences.**

- 👍 Missing translations fail type checking; zero runtime dependencies; instant language switching.
- 👎 No ICU message syntax — complex sentences are split into separate keys.

## ADR-5 · Strict CSP with Trusted Types

**🧩 Context.** The app renders user-provided text and imports files. GitHub Pages cannot send security headers.

**✅ Decision.** Inject a CSP meta tag at build time with `script-src 'self'`, `style-src 'self'`, `object-src 'none'` and enforced Trusted Types, plus a single `default` policy that only allows the service worker URL. A CI script verifies the built HTML.

**⚖️ Consequences.**

- 👍 DOM XSS sinks are closed even if a future change slips through review.
- 👎 Inline scripts and styles are not possible in production, and new external resources require a conscious CSP change.

## ADR-6 · The Oxc toolchain and TypeScript 7

**🧩 Context.** `typescript-eslint` does not support the native TypeScript 7 compiler, and ESLint plus Prettier were the slowest part of the feedback loop.

**✅ Decision.** Use Oxlint (with type-aware rules through `oxlint-tsgolint`, React Compiler rules and a custom `no-comments` plugin) and Oxfmt for formatting, with TypeScript 7 for type checking.

**⚖️ Consequences.**

- 👍 Linting and formatting the whole project takes well under a second.
- 👎 A few ESLint plugins have no Oxlint equivalent yet; rules that matter are covered by tests or the custom plugin.

## ADR-7 · Local-first without a backend

**🧩 Context.** The app is a personal task list that should open instantly, work offline and keep data private.

**✅ Decision.** Store everything in `localStorage`, sync tabs through `storage` events, ship as a PWA and offer JSON export and import for backups and moving between devices.

**⚖️ Consequences.**

- 👍 No accounts, no latency, no server costs, nothing to breach.
- 👎 Data does not sync between devices automatically, and clearing site data removes it — hence the backup options in the menu and on the error screen.

## ADR-8 · Effects levels instead of one look for every device

**🧩 Context.** Users on Windows reported heavy lag. Profiling without a GPU showed the animated aurora forcing every `backdrop-filter` to be recomputed on every frame, one blur per task row, blend modes and the SVG refraction — together 25–30 fps and 40 % janky frames while scrolling.

**✅ Decision.** Add an **Effects** setting with `auto`, `full` and `lite`. Reduced (`lite`) keeps the glass but makes the backdrop still, drops blend modes, grain, refraction and the pointer light and lowers the blur radius. Auto picks Full only on Apple devices with at least eight cores.

**⚖️ Consequences.**

- 👍 60 fps idle and 58–60 fps scrolling in the same worst-case test, with no janky frames — content panels drop `backdrop-filter` entirely in Reduced, because a still backdrop does not need it.
- 👍 Users with fast machines can still opt into the full show.
- 👎 Two visual variants to keep in mind when designing; the CSS keys them off `<html data-effects>`.

## ADR-9 · Grouped rows and an inspector column

**🧩 Context.** Every task row was its own glass card, which looked busy, cost one blur per row and left wide screens with empty space while details opened in a modal.

**✅ Decision.** Render each section as one glass panel with hairline separators, and add a third **inspector** column from 1240 px that shows the overview or the selected task's details inline. Smaller screens keep the dialog and the bottom sheet.

**⚖️ Consequences.**

- 👍 Calmer lists that follow Apple's guidance — glass for controls, content on top of it — and far fewer blurs.
- 👍 Master-detail editing on desktop without covering the list.
- 👎 Two presentations of the details to test; both share the `TaskDetails` component.

## ADR-10 · Self-hosted Montserrat

**🧩 Context.** The app should use Montserrat, but loading fonts from Google would need CSP exceptions, leak visits to a third party and break offline use.

**✅ Decision.** Ship the variable font through `@fontsource-variable/montserrat`, with per-script files selected by `unicode-range` and precached by the service worker.

**⚖️ Consequences.**

- 👍 One file covers all weights; Latin Extended and Cyrillic cover Polish and Ukrainian; `font-src 'self'` stays strict.
- 👎 About 40–70 kB per script on the first visit, and Montserrat's width needs container queries where translations are long.

## ADR-11 · Lazy translations and remote flags

**🧩 Context.** Going from two to eight languages would have added every dictionary to the main bundle, and the language picker needed flags.

**✅ Decision.** Bundle English only and load the other dictionaries as separate chunks with `loadMessages()` before switching; show flags as SVG images from flagcdn.com, allowed narrowly by the CSP and requested without a referrer.

**⚖️ Consequences.**

- 👍 The main bundle did not grow; every language is still available offline through the precache.
- 👎 Flags are the first third-party request of the app — documented in [Security](./security.md#️-flag-images) — and appear only once the browser has fetched them.

## ADR-12 · Repeating tasks as new occurrences

**🧩 Context.** Repeating tasks can either move their own due date forward when completed (Todoist) or leave a completed copy behind (Reminders, Things). The app already has an activity chart, a streak and a Completed list that rely on completion timestamps.

**✅ Decision.** Completing a repeating task marks it completed, removes its repeat rule and inserts the next occurrence right after it — all in the `todoToggled` reducer, so it is a single undoable step. The next date is computed from the due date and moved past today when the task was finished late.

**⚖️ Consequences.**

- 👍 History, the activity chart and streaks count every occurrence; reopening an old occurrence never spawns duplicates.
- 👎 Completed occurrences pile up in Completed until cleared; monthly repeats on the 31st settle on shorter months.

## ADR-13 · Stay in the list after adding

**🧩 Context.** Adding a task that did not belong to the current list switched to **All tasks**, which pulled people out of Today in the middle of planning.

**✅ Decision.** Stay in the current list and show a notification that names the list the task went to, with a **Show** action that switches lists and focuses the task.

**⚖️ Consequences.**

- 👍 Planning flows are not interrupted, and the new task is one click away.
- 👎 Tasks added elsewhere are not visible immediately; the notification carries that information instead.
