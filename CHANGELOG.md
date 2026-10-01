# 📜 Changelog

All notable changes to this project are documented here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses [Semantic Versioning](https://semver.org/).

## 3.2.0 — 2026-10-02

### ✨ Added

- 🔁 **Repeating tasks** — every day, weekday, week, month or year, set in the details or typed in quick add in all eight languages (`every friday`, `щотижня`, `jeden Montag`, `tous les lundis`, `w każdy piątek`…). Completing one creates the next occurrence.
- 🗂️ **Date groups** — Today shows **Overdue** and **Today**; Upcoming is grouped by day for a week and by month afterwards, without repeating the date on every row.
- 📆 **Move to today** reschedules all overdue tasks at once, with **Undo** in the notification.
- 📍 Adding a task that belongs elsewhere keeps you in the current list and offers **Show** in the notification.
- 🌱 A friendly overview while there are no tasks yet.

### 🔄 Changed

- 🔍 The command palette opens from a **⌘K** button inside the search field; the separate header button is gone.
- 🔚 The footer bar was replaced by a small credits line at the end of the sidebar; list counters hide when a list is empty.
- 🧭 Code structure: the overview moved to `features/stats`, the ⋯ menu and the palette share commands in `features/commands`, and the details components are named `TaskDetails`, `TaskDetailsDialog` and `TaskDetailsPanel`.
- 🚀 With Reduced effects, task groups, the overview and empty states no longer use `backdrop-filter`: scrolling went from 25–50 to 58–60 fps in the worst-case test, also with many date groups.
- 🗃️ Storage format version **5** adds `repeat`; older data is migrated automatically.
- 📱 The composer's date chip turns into an icon on narrow screens, so the field stays on one line.

## 3.1.0 — 2026-10-01

### ✨ Added

- 🌍 **Six new languages** — Deutsch, Español, Français, Italiano, Nederlands and Polski, with flags from flagcdn, native names, correct plurals and typography, browser language detection and quick add phrases for each.
- ⚡ **Effects setting** — Auto, Full or Reduced. Reduced keeps the glass but stops the aurora, refraction and pointer light; Auto uses it everywhere except capable Apple devices.
- 🧾 **Inspector column** on screens from 1240 px: the overview, or the selected task's details right next to the list.
- 🏷️ **Tag cloud** in the sidebar with counters; click a tag to filter, click again to clear.
- 🔤 **Montserrat** as the interface font, self-hosted and precached.

### 🔄 Changed

- 🧱 Tasks sit on one grouped glass panel per section with hairline separators instead of a glass card per row.
- 📚 Lists and tags share one sidebar panel; the overview moves to the inspector on wide screens and below the list on phones.
- 🚀 Big performance work for Windows and integrated graphics: no per-row blur, a still backdrop without blend modes, pointer light batched per frame, lazy menus and translations, a shared day timer. Worst-case scrolling went from 25 fps with 40 % janky frames to 54 fps with none.
- 🎛️ The settings button uses a sliders icon and the language picker became a grid of flags.
- 🔚 The footer no longer shows the app version.

### 🐛 Fixed

- 📱 The overview card was hidden on phones.
- 🚀 The **New task** app shortcut now reliably focuses the composer.
- 🔤 Long translations no longer overflow the overview stats.

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
