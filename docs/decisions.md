# 🧭 Decisions

Short architecture decision records. Each one explains the context, the choice and what it costs, so future changes can revisit a decision deliberately instead of by accident.

| #                                                           | Decision                                          | Status      |
| ----------------------------------------------------------- | ------------------------------------------------- | ----------- |
| [ADR-1](#adr-1--feature-based-folders-with-enforced-layers) | Feature-based folders with enforced layers        | ✅ Accepted |
| [ADR-2](#adr-2--undo-and-redo-as-a-history-reducer)         | Undo and redo as a history reducer                | ✅ Accepted |
| [ADR-3](#adr-3--native-dialog-and-popover)                  | Native `<dialog>` and popover instead of a UI kit | ✅ Accepted |
| [ADR-4](#adr-4--a-small-typed-i18n-layer)                   | A small typed i18n layer instead of a library     | ✅ Accepted |
| [ADR-5](#adr-5--strict-csp-with-trusted-types)              | Strict CSP with Trusted Types                     | ✅ Accepted |
| [ADR-6](#adr-6--the-oxc-toolchain-and-typescript-7)         | The Oxc toolchain and TypeScript 7                | ✅ Accepted |
| [ADR-7](#adr-7--local-first-without-a-backend)              | Local-first without a backend                     | ✅ Accepted |

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
