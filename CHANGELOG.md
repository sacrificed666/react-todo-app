# 📜 Changelog

All notable changes to Tasks are documented here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project uses [Semantic Versioning](https://semver.org/spec/v2.0.0.html). How versions are cut is described in [docs/releases.md](./docs/releases.md).

## [Unreleased]

## [1.0.0] - 2026-10-05

The first release.

### Added

- 📚 Smart lists for all tasks, today, upcoming, important and completed tasks, with counters and a badge on the installed app.
- 📁 Projects with colours, emoji icons picked from a grid or typed in the name, their own pages and progress, and an undoable delete.
- ✍️ Quick add that understands dates, repeats, projects and importance in the title, in all ten languages.
- 🔁 Repeating tasks, subtasks with a progress chip, notes, a calendar and drag and drop between lists and projects.
- 🏷️ Tags on every task, picked or created with the **#** chip or typed as `#word`, with a tag cloud in the sidebar and in search.
- ↩️ Undo and redo for the last 50 changes, a context menu, a command palette and keyboard shortcuts for almost everything.
- 🎨 Light, dark and automatic themes, ten accents, six backgrounds, clear or tinted glass and full or reduced effects.
- 📱 A phone layout with a tab bar, swipes on rows and between lists and projects, haptics and a Back button that closes sheets.
- 💾 Autosave, sync between tabs, validated JSON import and export, offline mode, app shortcuts, a share target and update prompts.
- 🌍 Ten languages: English, Ukrainian, Czech, German, Spanish, French, Italian, Dutch, Polish and Portuguese, loaded on demand.
- ♿ WCAG AA support: full keyboard control, landmarks, live regions, forced colours, reduced motion and reduced transparency.
- 🛡️ A strict Content Security Policy with Trusted Types, validated imports and flags served by the app itself.
- 🧪 Unit tests, end-to-end tests on the production build, axe checks and a Lighthouse budget in CI, with deployment to GitHub Pages.
- 🐳 Docker images for development, staging and production: a multi-stage Dockerfile, a Compose overlay per environment and an unprivileged nginx with security headers and caching.
- 🛠️ A Makefile with a coloured, grouped `make help`: setup that creates `.env` from `.env.example`, the dev server, checks, end-to-end tests and every Docker environment.

[Unreleased]: https://github.com/sacrificed666/tasks/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/sacrificed666/tasks/releases/tag/v1.0.0
