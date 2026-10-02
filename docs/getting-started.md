# 🏁 Getting started

## 📋 Requirements

| Tool       | Version                                                                                       |
| ---------- | --------------------------------------------------------------------------------------------- |
| 🟢 Node.js | **24.15 or newer** (`.nvmrc` pins the active LTS line, `24`)                                  |
| 📦 npm     | 11 or newer (ships with Node 24)                                                              |
| 🌐 Browser | Any evergreen browser. Chromium-based browsers additionally render the glass refraction layer |

If you use a version manager, run `nvm use` (or `fnm use`) in the project root.

## 📦 Install and run

```bash
npm ci
npm run dev
```

The dev server prints a local URL. The app is served under the `/react-todo-app/` base path, the same one used on GitHub Pages, so open `http://localhost:5173/react-todo-app/`.

## 📜 npm scripts

| Script                  | What it does                                                                  |
| ----------------------- | ----------------------------------------------------------------------------- |
| `npm run dev`           | 🔥 Starts the Vite dev server with hot module replacement                     |
| `npm run build`         | 📦 Type-checks the project and builds the production bundle into `dist/`      |
| `npm run preview`       | 👀 Serves the production build locally, including the service worker          |
| `npm run typecheck`     | 🧠 Runs the TypeScript 7 compiler in build mode without emitting files        |
| `npm run lint`          | 🧹 Lints the code with Oxlint, including type-aware and React Compiler rules  |
| `npm run lint:fix`      | 🩹 Applies the automatic Oxlint fixes                                         |
| `npm run format`        | 🎨 Formats every supported file with Oxfmt                                    |
| `npm run format:check`  | 🔎 Fails if a file is not formatted                                           |
| `npm test`              | 👁️ Starts Vitest in watch mode                                                |
| `npm run test:run`      | 🧪 Runs the whole test suite once                                             |
| `npm run test:coverage` | 📊 Runs the tests with V8 coverage and enforces the coverage thresholds       |
| `npm run check`         | ✅ Lint, format check, type check and tests in one go — run it before pushing |

After `npm run build`, `node scripts/build-report.mjs` prints the bundle sizes and verifies the security headers, exactly as the pipeline does.

## 🗂️ Project layout

```text
react-todo-app/
├── .github/
│   ├── ISSUE_TEMPLATE/              Bug report and feature request forms
│   ├── workflows/ci.yml             CI/CD: verify, build, dependency review, deploy
│   ├── workflows/codeql.yml         CodeQL code scanning
│   ├── dependabot.yml               Weekly dependency and GitHub Actions updates
│   ├── PULL_REQUEST_TEMPLATE.md
│   └── SECURITY.md                  How to report vulnerabilities
├── docs/                            This documentation and its screenshots
├── lint/no-comments.js              Custom Oxlint rule that forbids comments
├── public/                          Favicons and PWA icons copied as-is
├── scripts/                         Coverage summary and build report for the pipeline
├── src/
│   ├── app/                         Entry point, App shell, store, persistence, launch intents, PWA, back button, error screen
│   ├── widgets/                     Sidebar, Toolbar (phones), Workspace, Inspector, Backdrop
│   ├── features/
│   │   ├── todos/                   Task model, repeats, quick add, checklists; composer, list, rows, context menu, drag and drop, details
│   │   ├── projects/                Project model, colours and emoji icons; sidebar list, picker, dialog
│   │   ├── lists/                   Smart lists and project views, date groups, sorting, view state; navigation, tags, tab bar, Lists sheet, list header
│   │   ├── data/                    The stored document, import and export, undo history
│   │   ├── stats/                   Activity, streak and project progress; the overview card
│   │   ├── commands/                Shared task commands; the ⋯ menu and the ⌘K palette
│   │   ├── search/                  Search field
│   │   ├── settings/                Appearance, accent, background, glass, language and effects; the settings dialog
│   │   ├── i18n/                    Messages in eight languages, the lazy catalog, names, flags, week starts and the translator
│   │   └── notifications/           Toast state, the Toaster and the offline badge
│   ├── shared/
│   │   ├── ui/                      Icon, IconButton, Checkbox, Popover, Dialog, ContextMenu, Calendar, SwatchPicker, SegmentedControl, ProgressBar, EmptyState, Brand
│   │   ├── hooks/                   Liquid glass, effects level, shortcuts, media queries, scroll position, online status, app badge, today, pointer light
│   │   ├── lib/                     Dates and calendars, keyboard, fuzzy search, storage, motion, refraction, effects, haptics, confetti, Trusted Types
│   │   ├── styles/                  Design tokens, accent and background palettes, glass and menu mixins, global styles
│   │   └── assets/                  Flow-lines artwork used by the backdrop
│   ├── test/                        Test setup, polyfills, factories and render helpers
│   └── types/                       Global type declarations
├── index.html
├── vite.config.ts                   Vite, React Compiler, PWA, CSP and Vitest configuration
├── .oxlintrc.json                   Lint rules and layer boundaries
└── .oxfmtrc.json                    Formatting rules
```

Every feature has a `model/` folder for state and logic and, when it renders something, a `ui/` folder with one folder per component, for example `features/todos/ui/TodoItem/TodoItem.tsx` and `TodoItem.module.scss`. Tests sit next to the code they cover as `*.test.ts(x)`. The layers and their rules are explained in [Architecture](./architecture.md#-layers).

## 💻 Editor setup

Editor settings are not committed. For the best experience in VS Code, install:

- 🦀 **Oxc** — inline Oxlint diagnostics and Oxfmt formatting on save
- ⚡ **Vitest** — run and debug tests from the editor
- 📝 **EditorConfig** — consistent whitespace settings (`.editorconfig` is part of the repository)

## 👉 Next steps

- ✨ Learn what the app can do in [Features](./features.md).
- 🏗️ Understand how data flows through the app in [Architecture](./architecture.md).
- 🌍 Add or change texts with the [Localization](./i18n.md) guide.
