# 📜 Changelog

All notable changes to this project are documented here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses [Semantic Versioning](https://semver.org/).

## 3.0.0 — 2026-10-01

### ✨ Added

- ⌘ **Command palette** (<kbd>⌘</kbd>/<kbd>Ctrl</kbd>+<kbd>K</kbd>) with fuzzy search over lists, actions, tasks, sort orders, appearance and language.
- ⚡ **Quick add** — dates (`tomorrow`, `next friday`, `in 3 days`, `20.10`, `завтра`, `через 3 дні`, `у п’ятницю`…), `!` for importance and trailing `#tags` are recognised while typing.
- 🗒️ **Task details sheet** with notes, Markdown checklists (`- [ ] item`), tags, timestamps, **Duplicate** and **Delete**.
- 🏷️ **Tags** — `#words` in titles become chips that filter the list.
- ↩️ **Undo and redo for every change** — 50 steps, <kbd>⌘</kbd>/<kbd>Ctrl</kbd>+<kbd>Z</kbd>, <kbd>⇧</kbd>+<kbd>⌘</kbd>/<kbd>Ctrl</kbd>+<kbd>Z</kbd> and <kbd>Ctrl</kbd>+<kbd>Y</kbd>, with a description of each step.
- 🌍 **Ukrainian translation** with correct plurals, dates and typography, and automatic language detection.
- 📱 **Bottom tab bar** on phones, **swipe** right to complete and left to delete, haptic feedback.
- ⌨️ **Keyboard commands on rows** — <kbd>↑</kbd>/<kbd>↓</kbd>, <kbd>Alt</kbd>+<kbd>↑</kbd>/<kbd>↓</kbd>, <kbd>S</kbd>, <kbd>D</kbd>, <kbd>E</kbd>, <kbd>I</kbd>, <kbd>Delete</kbd>.
- 📊 **Activity chart and streak** in the overview, 🎊 confetti when a list is finished.
- 📲 **PWA integration** — update prompt, offline badge, app badge with today's count, manifest shortcuts, share target and Window Controls Overlay.
- 🧯 **Error screen** with backup download and recovery options.
- ⏭️ **Skip to tasks** link and a shared `Checkbox` component.

### 🔄 Changed

- 🧭 Source code reorganised into `app`, `widgets`, `features` and `shared` layers with lint-enforced boundaries.
- 🔎 Search now also matches notes; on phones the search field stays visible while a query is active.
- 🗃️ Storage format version **4** adds `notes`; older data and exports are migrated automatically.
- 🔔 Notifications are stored as translatable message keys and gained success and error icons.
- 📐 Narrow task rows show fewer actions and a compact layout.
- 🧪 Coverage thresholds raised to 88 / 85 / 85 / 88 %.

### 🛡️ Security

- 🧱 Strict Content Security Policy with **Trusted Types** in production builds.
- 🆔 Imported and stored ids are validated; unsafe ones are replaced.
- 🔬 CodeQL scanning for TypeScript and workflows, `npm audit signatures` and a build report that verifies the security headers in CI.
- 🔐 Checkouts no longer persist credentials; a security policy and issue forms were added.

## 2.0.0 — 2026-10-01

### ✨ Added

- 🫧 Liquid Glass interface with refraction, an aurora backdrop, five accents and light and dark appearances.
- 📚 Smart lists (All tasks, Today, Upcoming, Important, Completed), due dates, stars and five sort orders.
- 🖐️ Drag and drop with keyboard support, undo for deletions, JSON import and export, cross-tab sync and an installable PWA.

### 🔄 Changed

- ⚛️ Rewritten with React 19, Redux Toolkit, Vite 8 and TypeScript 7.

## 1.0.0 — 2025-10-26

### ✨ Added

- 📝 The first version: add, complete, edit and delete tasks stored in `localStorage`.
