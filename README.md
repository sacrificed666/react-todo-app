# 📝 React ToDo App

[![CI/CD](https://github.com/sacrificed666/react-todo-app/actions/workflows/ci.yml/badge.svg)](https://github.com/sacrificed666/react-todo-app/actions/workflows/ci.yml)
[![CodeQL](https://github.com/sacrificed666/react-todo-app/actions/workflows/codeql.yml/badge.svg)](https://github.com/sacrificed666/react-todo-app/actions/workflows/codeql.yml)

A task manager wrapped in Apple-inspired **Liquid Glass**: translucent, refractive controls floating over an aurora backdrop. Built with React 19, Redux Toolkit and Vite 8 — smooth on any computer, offline-first, available in eight languages and private by design.

**[🌐 Live demo](https://sacrificed666.github.io/react-todo-app/)**

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="./docs/images/desktop-dark.jpg" />
  <img src="./docs/images/desktop-light.jpg" alt="ToDo App with smart lists, an overview card and a task list in Liquid Glass" />
</picture>

## ✨ Highlights

- 🫧 **Liquid Glass UI** — glass header, sidebar and inspector, grouped task panels with specular rims, spring motion and real edge refraction in Chromium
- 🖥️ **Three-pane layout** — lists and tags on the left, tasks in the middle, an inspector with the overview or the open task on the right; a tab bar and bottom sheets on phones
- ⚡ **Fast everywhere** — an **Effects** setting (Auto, Full, Reduced) that keeps Windows laptops at 60 fps; Auto chooses for you
- 🌍 **Eight languages with flags** — English, Українська, Deutsch, Español, Français, Italiano, Nederlands and Polski, with correct plurals, dates and typography, loaded on demand
- ✍️ **Quick add** — type `Call mom tomorrow !`, `Teammeeting am Freitag` or `Полити квіти щотижня` and the date, repeat and importance are filled in for you
- 🔁 **Repeating tasks** — every day, weekday, week, month or year; completing one creates the next occurrence
- 🗂️ **Planning views** — Today separates overdue tasks with a one-click **Move to today**, Upcoming is grouped by day and month
- ⌘ **Command palette** — <kbd>⌘</kbd>/<kbd>Ctrl</kbd>+<kbd>K</kbd> to jump anywhere, run any action or find any task with fuzzy search
- 🗒️ **Details and checklists** — notes, `- [ ]` checklists with progress chips, `#tags` with a tag cloud, duplicate and delete
- ↩️ **Undo everything** — 50 steps of undo and redo with a description of each change
- 📚 **Smart lists** — All tasks, Today, Upcoming, Important and Completed with live counters, an activity chart and a streak
- 📱 **Made for phones too** — swipe to complete or delete, haptics, a floating tab bar
- 🔤 **Montserrat** — self-hosted variable font with Latin, Polish and Cyrillic coverage
- 💾 **Local-first PWA** — autosave, cross-tab sync, JSON import and export, offline mode, app shortcuts, share target and update prompts
- 🛡️ **Secure by default** — strict CSP with Trusted Types, validated imports, CodeQL and signed dependencies
- ♿ **Accessible** — full keyboard control, focus management, screen reader announcements, reduced motion, transparency and contrast support

<p align="center">
  <img src="./docs/images/mobile-dark.jpg" alt="The app on a phone with the tab bar" width="260" />
  <img src="./docs/images/settings.jpg" alt="Settings with eight languages and the effects switch" width="300" />
</p>

![Task details in the inspector column](./docs/images/desktop-details.jpg)

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
| 🧭 [Decisions](./docs/decisions.md)             | Architecture decision records                         |
| ❓ [FAQ](./docs/faq.md)                         | Common questions                                      |

📜 See [CHANGELOG.md](./CHANGELOG.md) for release notes.

## ✍️ Author

**[Illia Movchko](https://github.com/sacrificed666)**

## 📝 License

This project is licensed under the **[MIT License](https://choosealicense.com/licenses/mit/)**.
