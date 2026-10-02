# 📝 React ToDo App

[![CI/CD](https://github.com/sacrificed666/react-todo-app/actions/workflows/ci.yml/badge.svg)](https://github.com/sacrificed666/react-todo-app/actions/workflows/ci.yml)
[![CodeQL](https://github.com/sacrificed666/react-todo-app/actions/workflows/codeql.yml/badge.svg)](https://github.com/sacrificed666/react-todo-app/actions/workflows/codeql.yml)

A task manager wrapped in Apple-inspired **Liquid Glass**: translucent, refractive islands floating over a living backdrop — no header bar, no footer, just your tasks. Built with React 19, Redux Toolkit and Vite 8 — smooth on any computer, offline-first, available in eight languages and private by design.

**[🌐 Live demo](https://sacrificed666.github.io/react-todo-app/)**

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="./docs/images/desktop-dark.jpg" />
  <img src="./docs/images/desktop-light.jpg" alt="ToDo App with the sidebar, projects, the task list and the overview in Liquid Glass" />
</picture>

## ✨ Highlights

- 🫧 **Liquid Glass UI** — floating glass islands instead of header and footer bars, grouped task panels with specular rims, spring motion and real edge refraction in Chromium
- 📁 **Projects** — group tasks into Work, 🏠 Home or a trip, with ten colours, emoji icons, `@project` in quick add and progress bars in the overview
- 🖱️ **Context menu** — right-click or long-press any task to schedule, star, complete, move, rename, duplicate or delete it
- 📅 **Calendar** — a glass month view with dots on busy days and the first day of the week your region expects
- ✋ **Drag to organise** — drop a task on Today, Upcoming, Important, Completed or a project in the sidebar
- 🎨 **Make it yours** — ten accents, six backgrounds (Aurora, Spectrum, Sunset, Ocean, Nebula, Plain) and clear or tinted glass
- 🔎 **Search everything** — one search across every list and project, and a <kbd>⌘</kbd>/<kbd>Ctrl</kbd>+<kbd>K</kbd> palette for everything else
- ✍️ **Quick add** — type `Call mom tomorrow @home !`, `Teammeeting am Freitag` or `Полити квіти щотижня` and the date, repeat, project and importance are filled in for you
- 🔁 **Repeating tasks** — every day, weekday, week, month or year; monthly tasks keep their day even after a short month
- 🗂️ **Planning views** — Today separates overdue tasks with a one-click **Move to today**, Upcoming is grouped by day and month
- ⚡ **Fast everywhere** — an **Effects** setting keeps Windows laptops at 60 fps, and lists with thousands of tasks stay instant
- 🌍 **Eight languages with flags** — English, Українська, Deutsch, Español, Français, Italiano, Nederlands and Polski, with correct plurals, dates and typography, loaded on demand
- 🗒️ **Details and checklists** — notes, `- [ ]` checklists with progress chips, `#tags` with a tag cloud, duplicate and delete
- ↩️ **Undo everything** — 50 steps of undo and redo for tasks and projects, with a description of each change
- 📱 **Made for phones too** — a floating tab bar with a Lists sheet, swipes, long press, haptics and a Back button that closes sheets
- 🔤 **Montserrat** — self-hosted variable font with Latin, Polish and Cyrillic coverage
- 💾 **Local-first PWA** — autosave, cross-tab sync, JSON import and export, offline mode, app shortcuts, share target and update prompts
- 🛡️ **Secure by default** — strict CSP with Trusted Types, validated imports, CodeQL and signed dependencies
- ♿ **Accessible** — full keyboard control, ARIA menus and dialogs, screen reader announcements, reduced motion, transparency and contrast support, checked with axe

<p align="center">
  <img src="./docs/images/mobile-dark.jpg" alt="Today on a phone with overdue tasks and the tab bar" width="260" />
  <img src="./docs/images/mobile-lists.jpg" alt="The Lists sheet with smart lists, projects and tags" width="260" />
</p>

![Task details in the inspector column](./docs/images/desktop-details.jpg)

![The six backgrounds](./docs/images/backgrounds.jpg)

## ⚛️ Front-end

![TypeScript](https://skillicons.dev/icons?i=ts)
![React](https://skillicons.dev/icons?i=react)
![Redux](https://skillicons.dev/icons?i=redux)
![Vite](https://skillicons.dev/icons?i=vite)
![SASS](https://skillicons.dev/icons?i=sass)

## 🧰 Tooling

![Node.js](https://skillicons.dev/icons?i=nodejs)
![Vitest](https://skillicons.dev/icons?i=vitest)
![GitHub Actions](https://skillicons.dev/icons?i=githubactions)

TypeScript 7 · Oxlint · Oxfmt · Vitest 5 · Testing Library · React Compiler · Montserrat · CodeQL · GitHub Pages

## 🚀 Quick start

Requires Node.js 24.15 or newer.

```bash
npm ci
npm run dev
```

Open `http://localhost:5173/react-todo-app/`. Run `npm run check` before pushing to lint, format-check, type-check and test in one go.

## 📚 Documentation

| Guide                                           | Topics                                                |
| ----------------------------------------------- | ----------------------------------------------------- |
| 🏁 [Getting started](./docs/getting-started.md) | Requirements, scripts and project layout              |
| ✨ [Features](./docs/features.md)               | Everything the app can do, shortcuts and gestures     |
| 🏗️ [Architecture](./docs/architecture.md)       | Layers, state, undo and redo, persistence and startup |
| 🎨 [Design system](./docs/design.md)            | Liquid Glass, refraction, backdrop and motion         |
| 🌍 [Localization](./docs/i18n.md)               | Messages, plurals, dates and adding a language        |
| 🛡️ [Security](./docs/security.md)               | CSP, Trusted Types, validation and supply chain       |
| 🧪 [Testing](./docs/testing.md)                 | Test stack, helpers, conventions and coverage         |
| 🚀 [Deployment](./docs/deployment.md)           | CI/CD, CodeQL, GitHub Pages and PWA updates           |
| 🤝 [Contributing](./docs/contributing.md)       | Workflow, code style and commit conventions           |
| ❓ [FAQ](./docs/faq.md)                         | Common questions                                      |

## ✍️ Author

**[Illia Movchko](https://github.com/sacrificed666)**

## 📝 License

This project is licensed under the **[MIT License](https://choosealicense.com/licenses/mit/)**.
