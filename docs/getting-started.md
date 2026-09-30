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

## 🗂️ Project layout

```text
react-todo-app/
├── .github/
│   ├── dependabot.yml          Weekly dependency and GitHub Actions updates
│   └── workflows/ci.yml        CI/CD pipeline: verify, build, review, deploy
├── docs/                       This documentation
├── lint/no-comments.js         Custom Oxlint rule that forbids comments
├── public/                     Favicons and PWA icons copied as-is
├── scripts/                    Node scripts used by the pipeline
├── src/
│   ├── assets/                 Flow-lines artwork used by the backdrop
│   ├── components/
│   │   ├── feedback/           Toaster with undo
│   │   ├── layout/             Backdrop, Header, Sidebar, Main, ListHeader, Footer
│   │   ├── todo/               Lists, overview, composer, due picker, search, sort and theme menus, list, sections, items
│   │   └── ui/                 Reusable primitives: Icon, IconButton, Popover, SegmentedControl, ProgressBar, EmptyState
│   ├── hooks/                  Liquid glass, shortcuts, pointer light, current day, theme sync
│   ├── lib/                    Framework-free helpers: todo model, dates, smart lists, sorting, theme, storage, refraction
│   ├── store/                  Redux store, slices, selectors, thunks and persistence
│   ├── styles/                 Design tokens, glass mixins and global styles
│   ├── test/                   Test setup, factories and render helpers
│   ├── types/                  Global type augmentations
│   ├── App.tsx
│   └── main.tsx
├── index.html
├── vite.config.ts              Vite, React Compiler, PWA and Vitest configuration
├── .oxlintrc.json              Lint rules
└── .oxfmtrc.json               Formatting rules
```

Every component lives in its own folder next to its CSS module, for example `components/todo/TodoItem/TodoItem.tsx` and `TodoItem.module.scss`. Tests sit next to the code they cover as `*.test.ts(x)`.

## 💻 Editor setup

Editor settings are not committed. For the best experience in VS Code, install:

- 🦀 **Oxc** — inline Oxlint diagnostics and Oxfmt formatting on save
- ⚡ **Vitest** — run and debug tests from the editor
- 📝 **EditorConfig** — consistent whitespace settings (`.editorconfig` is part of the repository)

## 👉 Next steps

- ✨ Learn what the app can do in [Features](./features.md).
- 🏗️ Understand how data flows through the app in [Architecture](./architecture.md).
