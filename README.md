# 📝 Todo App

[![CI/CD](https://github.com/sacrificed666/react-todo-app/actions/workflows/ci.yml/badge.svg)](https://github.com/sacrificed666/react-todo-app/actions/workflows/ci.yml)
[![CodeQL](https://github.com/sacrificed666/react-todo-app/actions/workflows/codeql.yml/badge.svg)](https://github.com/sacrificed666/react-todo-app/actions/workflows/codeql.yml)

A private to-do list that lives in your browser. Plan the day with smart lists, group tasks into
projects, repeat them on a schedule and find anything with one search, on a computer or a phone,
online or offline.

Built with React 19, Redux Toolkit and Vite 8 as a static, local-first web app. Your tasks stay on
your device: no account, no server and no analytics.

**[🌐 Live demo](https://sacrificed666.github.io/react-todo-app/)**

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="./docs/images/desktop-dark.jpg" />
  <img src="./docs/images/desktop-light.jpg" alt="Tasks with the sidebar, projects, the task list and the overview" />
</picture>

---

## ✨ What it does

### 📚 Smart lists

**All tasks**, **Today**, **Upcoming**, **Important** and **Completed**, each with a counter. Today keeps
overdue tasks apart and moves them all to today in one step, Upcoming is grouped by day and month,
and the installed app shows the Today count as a badge on its icon.

### 📁 Projects

Group tasks into Work, 🏠 Home or a trip. Every project has one of ten colours, an optional emoji
icon, its own page with progress, and a place in the overview. Deleting a project can be undone
together with all of its tasks.

### ✍️ Quick add

Type `Call mom tomorrow @home !`, `Teammeeting am Freitag` or `Полити квіти щотижня` and the date,
repeat, project and importance are filled in for you, in all eight languages.

### ✅ Tasks

- **Repeats** every day, weekday, week, month or year. Monthly tasks keep their day after a short month.
- **Details** with notes, `- [ ]` checklists with a progress chip and `#tags` with a tag cloud.
- **A context menu** on right-click or long press to schedule, star, complete, move, rename,
  duplicate or delete a task.
- **A calendar** with dots on busy days, starting the week on the day your region expects.
- **Drag and drop** to reorder tasks or drop them on a list or project in the sidebar.
- **Undo and redo** for the last 50 changes to tasks and projects, each with a description.

### 🔎 Search and commands

One search across every list and project, and a <kbd>⌘</kbd>/<kbd>Ctrl</kbd>+<kbd>K</kbd> palette for
navigation, actions, sorting, appearance and language. Almost everything has a keyboard shortcut.

### 🎨 Appearance

Light, dark or automatic theme, ten accents, six backgrounds (Aurora, Spectrum, Sunset, Ocean,
Nebula and Plain) and clear or tinted glass panels. The **Effects** setting keeps older laptops at
60 fps, and lists with thousands of tasks stay instant.

### 📱 Phones

A floating tab bar with a Lists sheet, swipes to complete or delete, long press, haptics and a Back
button that closes sheets instead of leaving the app.

### 💾 Your data

Autosave, sync between tabs, JSON import and export, offline mode, app shortcuts, a share target and
update prompts. Imported files are validated field by field.

### 🌍 Eight languages

English, Ukrainian, German, Spanish, French, Italian, Dutch and Polish, with correct plurals, dates
and typography, loaded on demand.

### ♿ Accessibility

WCAG AA contrast, full keyboard control, landmarks, live regions and page titles for screen readers,
Windows high contrast, reduced motion and reduced transparency, checked with axe and Lighthouse.

<p align="center">
  <img src="./docs/images/mobile-dark.jpg" alt="Today on a phone with overdue tasks and the tab bar" width="260" />
  <img src="./docs/images/mobile-lists.jpg" alt="The Lists sheet with smart lists, projects and tags" width="260" />
</p>

![Task details in the inspector column](./docs/images/desktop-details.jpg)

---

## 🚀 Quick start

Requires **Node.js 24.15** or newer.

```bash
npm ci
npm run dev          # http://localhost:5173/react-todo-app/
```

```bash
npm run check        # lint, format check, type check and unit tests in one go
npm run test:e2e     # browsers, offline mode, accessibility and Lighthouse on the production build
npm run build        # production build in dist/
```

---

## 📚 Documentation

Everything else lives in [`docs/`](./docs):

| Guide                                           | Topics                                                |
| ----------------------------------------------- | ----------------------------------------------------- |
| 🏁 [Getting started](./docs/getting-started.md) | Requirements, scripts and project layout              |
| ✨ [Features](./docs/features.md)               | Everything the app can do, shortcuts and gestures     |
| 🏗️ [Architecture](./docs/architecture.md)       | Layers, state, undo and redo, persistence and startup |
| 🎨 [Design system](./docs/design.md)            | Glass surfaces, refraction, backgrounds and motion    |
| 🌍 [Localization](./docs/i18n.md)               | Messages, plurals, dates and adding a language        |
| ♿ [Accessibility](./docs/accessibility.md)     | Keyboard, screen readers, contrast modes and checks   |
| 🛡️ [Security](./docs/security.md)               | CSP, Trusted Types, validation and supply chain       |
| 🧪 [Testing](./docs/testing.md)                 | Unit and browser tests, axe, Lighthouse and coverage  |
| 🚀 [Deployment](./docs/deployment.md)           | CI/CD, CodeQL, GitHub Pages and PWA updates           |
| 🤝 [Contributing](./docs/contributing.md)       | Workflow, code style and commit conventions           |
| ❓ [FAQ](./docs/faq.md)                         | Common questions                                      |

---

## 🧱 Stack

React 19 with the React Compiler, Redux Toolkit, TypeScript 7, Vite 8 and Sass modules. dnd-kit for
drag and drop, the self-hosted Montserrat variable font, Vitest 5 with Testing Library, Oxlint and
Oxfmt, Playwright with axe and Lighthouse. The interface, the calendar and the charts are written by
hand, without a UI library. Deployed to GitHub Pages by GitHub Actions and scanned by CodeQL.

## 📌 Good to know

> [!WARNING]
> **Tasks stay in this browser** and clearing its site data deletes them. Use **⋯** → **Export tasks** to
> back them up or move them to another device.

- **Tabs sync, devices do not.** Changes appear in every open tab of the same browser right away.
- **Slow computer?** Pick **Reduced** effects or the **Plain** background in the settings.
- **Edge refraction is Chromium only.** Other browsers get the same glass without the lens effect.

## ✍️ Author

**[Illia Movchko](https://github.com/sacrificed666)**

## 📝 License

Licensed under the **[MIT License](https://choosealicense.com/licenses/mit/)**.
