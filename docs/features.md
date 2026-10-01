# ✨ Features

## 🧭 Layout

| Area           | Desktop and tablet                                                                                  | Phone (narrower than 900 px)                                      |
| -------------- | --------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| 🔝 Header      | Full-width glass bar: logo, search, command palette, settings and the **⋯** actions menu            | Search moves behind a 🔍 button below 720 px                      |
| 📚 Lists       | Sidebar with the smart lists and live counters                                                      | A floating glass **tab bar** at the bottom with a badge for Today |
| 📊 Overview    | Below the lists: progress, overdue, today and important counts, a 7-day activity chart and a streak | Moves below the task list                                         |
| 📝 Main column | List title with today's date and progress, sort menu, composer and the task list                    | Same, rows switch to a compact two-line layout                    |
| 🔚 Footer      | Full-width status bar with task totals, overdue count, author, source link and app version          | Stacked and centred                                               |

![Desktop, dark appearance](./images/desktop-dark.jpg)

## 📚 Smart lists

| List         | Shows                                                        | Shortcut     |
| ------------ | ------------------------------------------------------------ | ------------ |
| 📥 All tasks | Every task, with completed ones in a collapsible section     | <kbd>1</kbd> |
| ☀️ Today     | Tasks due today or overdue, plus the ones you finished today | <kbd>2</kbd> |
| 📅 Upcoming  | Tasks due after today                                        | <kbd>3</kbd> |
| ⭐ Important | Starred tasks                                                | <kbd>4</kbd> |
| ✅ Completed | Everything you have finished                                 | <kbd>5</kbd> |

- 🔢 Counters show how many active tasks each list holds; the **Today** counter turns red when something is overdue. Installed apps also show the Today count as an **app badge** on the icon.
- 🎯 New tasks inherit the context of the list: in **Today** they are due today, in **Upcoming** tomorrow, in **Important** they are starred.
- 🔁 If a new task would not belong to the current list, the app switches to **All tasks** so you can see it.
- 💾 The selected list is remembered between visits.

## ✅ Tasks

| Action      | How                                                                                                                                                 |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| ➕ Add      | Type in **Add a task** and press <kbd>Enter</kbd>. Pick a due date with the calendar chip and star it with ☆, or let [quick add](#-quick-add) do it |
| ✅ Complete | Click the circle or swipe the row to the right. The check appears instantly and the task moves after a short pause — click again to undo it         |
| ✏️ Edit     | Click the title. <kbd>Enter</kbd> saves, <kbd>Esc</kbd> cancels, clicking elsewhere saves. An empty title keeps the original                        |
| ⭐ Star     | Press ☆ on a task. Starred tasks keep a filled star and appear in **Important**                                                                     |
| 📅 Schedule | Press the calendar button and choose **Today**, **Tomorrow**, **Next week**, a custom date or **Remove date**                                       |
| ℹ️ Details  | Press ⓘ to open the [details sheet](#️-details-notes-and-checklists) with notes, a checklist, dates, **Duplicate** and **Delete**                    |
| 🗑️ Delete   | Press the trash button or swipe the row to the left. The task can be restored from the notification                                                 |
| ↕️ Reorder  | Drag the handle, or press <kbd>Alt</kbd>+<kbd>↑</kbd>/<kbd>↓</kbd>. Reordering is available with the **Manual** sort order                          |

Due dates are shown as friendly labels — **Today**, **Tomorrow**, **Yesterday**, a weekday for the next few days or a short date — and are coloured: 🔴 overdue, 🟠 today, 🔵 later. Rows also show chips for 🏷️ tags, ☑️ checklist progress (`2/5`) and 🗒️ notes.

On narrow screens the calendar and trash buttons are hidden from the rows to leave room for the title; scheduling and deleting are then done in the details sheet or with swipes.

## ⚡ Quick add

The composer understands a few words at the **end** of the title. A ✨ chip shows what it recognised before you press <kbd>Enter</kbd>.

| You type                          | You get                                                     |
| --------------------------------- | ----------------------------------------------------------- |
| `Call mom tomorrow`               | **Call mom**, due tomorrow                                  |
| `Pay rent in 3 days !`            | **Pay rent**, due in three days, ⭐ important               |
| `Team sync next friday #work`     | **Team sync #work**, due next Friday                        |
| `Купити квіти через 2 дні`        | **Купити квіти**, due in two days                           |
| `Подзвонити в банк у п’ятницю !!` | **Подзвонити в банк**, due on Friday, ⭐ important          |
| `Renew passport 20.10`            | **Renew passport**, due on 20 October (next year if passed) |

| Kind             | English                                                   | Українська                                                        |
| ---------------- | --------------------------------------------------------- | ----------------------------------------------------------------- |
| 📅 Relative days | `today`, `tonight`, `tomorrow`, `day after tomorrow`      | `сьогодні`, `завтра`, `післязавтра`                               |
| 🗓️ Weeks         | `next week`, `in a week`                                  | `наступного тижня`, `через тиждень`                               |
| 🔢 In N days     | `in 5 days`                                               | `через 5 днів`                                                    |
| 📆 Weekdays      | `monday` … `sunday`, optionally with `on`, `next`, `this` | `понеділок` … `неділя`, also `у п’ятницю`, `наступного вівторка`* |
| 🧮 Exact dates   | `2026-10-20`, `20.10`, `20.10.2026`                       | the same formats                                                  |
| ⭐ Importance    | `!`, `!!` or `!!!` at the end                             | the same                                                          |
| 🏷️ Tags          | `#tags` at the end are kept in the title                  | the same                                                          |

\* Weekday names are matched in the nominative, accusative and genitive case (`середа`, `середу`, `середи`) with the prefixes `у`, `в`, `цей`, `цю`, `цього`, `цієї`, `наступний`, `наступну`, `наступного` and `наступної`. Both `'` and `’` work as the apostrophe.

The recognised date overrides the calendar chip only while it is in the text, and the title always keeps at least one word, so `Tomorrow` alone is a task called “Tomorrow”.

## 🗒️ Details, notes and checklists

The ⓘ button, the <kbd>I</kbd> key or a task found in the command palette opens the **details sheet** — a centred glass dialog on desktop and a bottom sheet on phones.

![Task details](./images/details.jpg)

- ✏️ **Title** — edit it inline; <kbd>Enter</kbd> or leaving the field saves it.
- ✅ **Completed**, ⭐ **Important** and 📅 **Due date** — the same controls as in the list.
- 🗒️ **Notes** — up to 2000 characters, saved when you leave the field. Notes are included in the search.
- ☑️ **Checklist** — lines written as `- [ ] item` or `- [x] item` appear as checkboxes under the notes. Ticking one updates the notes, and the row in the list shows the progress, for example `1/3`.
- 🏷️ **Tags** — tap a tag to close the sheet and filter the list by it.
- 🕒 **Dates** — when the task was created, last updated and completed, in your language's format.
- 📄 **Duplicate** creates an active copy right after the original; 🗑️ **Delete** removes the task with an undo notification.

## 🏷️ Tags

Any `#word` in a title is a tag. Tags are shown as chips instead of being repeated in the title, and clicking a chip searches for it, for example `#work`. Tags work in any script — `#дім`, `#travel`, `#q4`.

## 🔀 Sorting

The sort button next to the list title offers:

| Order           | Rule                                                      |
| --------------- | --------------------------------------------------------- |
| ✋ Manual       | Your own order, changed by drag and drop                  |
| 📅 Due date     | Earliest due date first, tasks without a date last        |
| ⭐ Importance   | Starred tasks first, the rest keep their manual order     |
| 🆕 Newest first | Most recently created first                               |
| 🔤 Title A–Z    | Alphabetical, ignoring case and sorting numbers naturally |

The chosen order applies to every list and is remembered.

## 🔎 Search

- 🔎 Search from the header or press <kbd>/</kbd>. Matching covers titles and notes and ignores letter case and diacritics, so `cafe` finds “Café”.
- ⌫ <kbd>Esc</kbd> clears the query, a second <kbd>Esc</kbd> leaves the field.
- 📱 On phones the search field stays visible while a query is active, so a tag filter is never hidden.
- 🫙 Every list has its own empty state, and a search without results says so.

## ⌘ Command palette

Press <kbd>⌘</kbd>/<kbd>Ctrl</kbd>+<kbd>K</kbd> or the ⌘ button in the header.

![Command palette](./images/palette.jpg)

- 🧭 **Lists** — jump to any smart list.
- ⚡ **Actions** — new task, undo and redo (with a description of the step), complete all or mark all as active, clear completed and export.
- ✅ **Tasks** — type to find tasks by title or notes; <kbd>Enter</kbd> opens their details.
- 🔀 **Sort**, 🎨 **Appearance** and 🌍 **Language** — change the sort order, colour scheme, accent and language without opening a menu. The current choice is marked with ✓.
- 🔎 **Search for “…”** — the last option always applies the typed text as the list search.

Matching is fuzzy: `gtt` finds **Go to Today** and `srt` finds **Sort by**. Use <kbd>↑</kbd>/<kbd>↓</kbd> to move, <kbd>Enter</kbd> to run and <kbd>Esc</kbd> to close.

## ↩️ Undo and redo

Every change to your tasks can be undone — completing, renaming, starring, scheduling, editing notes, reordering, deleting, importing.

- ↩️ <kbd>⌘</kbd>/<kbd>Ctrl</kbd>+<kbd>Z</kbd> undoes and <kbd>⇧</kbd>+<kbd>⌘</kbd>/<kbd>Ctrl</kbd>+<kbd>Z</kbd> or <kbd>Ctrl</kbd>+<kbd>Y</kbd> redoes the last 50 changes. A notification names the step, for example “Undone: rename “Buy milk””.
- 🧰 The **⋯** menu and the command palette show the same commands with the step they would undo.
- 🗑️ Deleting or clearing shows a notification with **Undo** for six seconds; the timer pauses while the pointer or focus is on it.
- ✍️ Inside text fields the shortcuts keep their usual meaning.

## 🎉 Progress and motivation

- 📈 The list header shows how many tasks of the current list are done, with a progress bar that turns green when the list is finished.
- 📊 **Overview** sums up the whole collection and draws a bar chart of the tasks you completed on each of the last seven days.
- 🔥 A **streak** counts the consecutive days with at least one completed task.
- 🎊 Completing the last active task of a list shows “Everything in Today is done!” and a burst of confetti in your accent colours (skipped with reduced motion).

## 🎨 Appearance and 🌍 language

The palette button in the header opens the settings:

- 🌗 **Auto**, **Light** or **Dark** colour scheme — Auto follows the operating system and switches live.
- 🎨 Five accents — 🔵 Ocean blue, 🟣 Aurora violet, 🟠 Sunset, 🟢 Forest and ⚪ Graphite. The accent tints checkboxes, buttons, progress bars and the animated backdrop.
- 🌍 **English** or **Українська** — the whole interface, dates, plurals, notifications and quick add switch instantly. On the first visit the language follows your browser.
- 💾 All three choices are saved and applied before the first paint, so the app never flashes the wrong theme.

![Phone, light appearance](./images/mobile-light.jpg)

## 🧰 More actions menu

The **⋯** button opens a menu with:

- ↩️ **Undo** and ↪️ **Redo** with the name of the step
- ✅ **Complete all** or **Mark all as active**, depending on the current state
- 🧹 **Clear completed**
- 📤 **Export tasks** — downloads `todos-YYYY-MM-DD.json`
- 📥 **Import tasks** — merges tasks from a JSON file (up to 2 MB and 5000 tasks)
- ⌨️ A cheat sheet of keyboard shortcuts (hidden on touch-only devices)

## 🔄 Import and export

Exported files look like this:

```json
{
  "app": "react-todo-app",
  "version": 4,
  "exportedAt": "2026-10-01T10:00:00.000Z",
  "todos": [
    {
      "id": "V1StGXR8_Z5jdHi6B-myT",
      "title": "Book train tickets to Lviv #travel",
      "completed": false,
      "important": true,
      "dueDate": "2026-10-02",
      "notes": "- [x] Check the timetable\n- [ ] Pick seats",
      "createdAt": 1790841600000,
      "updatedAt": 1790841600000,
      "completedAt": null
    }
  ]
}
```

Importing never deletes anything:

- 🔁 tasks whose `id` already exists are skipped, new ones are appended to the list;
- 📄 a plain array of tasks is accepted as well as the full export;
- 🕰️ files from earlier versions — without `notes`, `important` and `dueDate`, or in the first `{ "id", "text", "isCompleted" }` format — are converted automatically;
- 🚫 invalid entries, dates and ids are ignored or replaced, and broken or oversized files are reported in a notification.

## 💾 Persistence and sync

- 💾 Tasks, the selected list, sort order, the completed section state, appearance and language are saved to `localStorage` after every change.
- 🔄 Changes made in another tab of the same browser appear immediately.
- 🕰️ Data saved by earlier versions of the app is migrated to the new format on first launch.
- 🔒 Nothing leaves your device: there is no account, no server and no analytics.

## 📱 Install, offline and app integration

ToDo App is a Progressive Web App:

- 📲 **Install** it from the browser menu; it then opens in its own window. On desktop Chromium the header can blend into the title bar (Window Controls Overlay).
- ✈️ **Offline** — after the first visit everything works without a network connection. The header shows an **Offline** badge while you are disconnected, and a notification confirms when the app is ready to work offline.
- 🔄 **Updates** — when a new version is downloaded, a notification offers **Reload**. Nothing changes under your feet while you work.
- 🚀 **Shortcuts** — the installed app's icon menu offers **New task**, **Today** and **Important**.
- 📤 **Share target** — share a page or text from another app to ToDo (where supported) and it becomes a task with the link in its notes.
- 🔴 **Badge** — the number of tasks due today appears on the app icon.

## ⌨️ Keyboard shortcuts

| Shortcut                                                                                   | Action                                         |
| ------------------------------------------------------------------------------------------ | ---------------------------------------------- |
| <kbd>⌘</kbd>/<kbd>Ctrl</kbd> + <kbd>K</kbd>                                                | Open or close the command palette              |
| <kbd>N</kbd>                                                                               | Focus the new task field                       |
| <kbd>/</kbd>                                                                               | Open and focus search                          |
| <kbd>1</kbd> – <kbd>5</kbd>                                                                | Switch between smart lists                     |
| <kbd>⌘</kbd>/<kbd>Ctrl</kbd> + <kbd>Z</kbd>                                                | Undo                                           |
| <kbd>⇧</kbd> + <kbd>⌘</kbd>/<kbd>Ctrl</kbd> + <kbd>Z</kbd>, <kbd>Ctrl</kbd> + <kbd>Y</kbd> | Redo                                           |
| <kbd>↑</kbd> / <kbd>↓</kbd>                                                                | Move to the previous or next task              |
| <kbd>Alt</kbd> + <kbd>↑</kbd> / <kbd>↓</kbd>                                               | Move the focused task up or down (Manual sort) |
| <kbd>Space</kbd>                                                                           | Complete the focused task                      |
| <kbd>S</kbd> / <kbd>D</kbd> / <kbd>E</kbd> / <kbd>I</kbd>                                  | Star, schedule, edit or open details           |
| <kbd>Delete</kbd> / <kbd>Backspace</kbd>                                                   | Delete the focused task                        |
| <kbd>Enter</kbd> / <kbd>Esc</kbd>                                                          | Save / cancel while editing                    |
| <kbd>Esc</kbd>                                                                             | Clear, then leave the search; close dialogs    |
| <kbd>Space</kbd> + arrows                                                                  | Reorder with the drag handle                   |

Global shortcuts are ignored while you type in a text field. Task commands work when focus is anywhere inside a task row.

## 👆 Touch gestures

| Gesture              | Action                                            |
| -------------------- | ------------------------------------------------- |
| 👉 Swipe a row right | Complete (or reopen) the task — a green ✓ appears |
| 👈 Swipe a row left  | Delete the task with undo — a red 🗑️ appears      |
| ✋ Drag the ≡ handle | Reorder tasks in the Manual sort order            |

Swipes arm with a short vibration once they pass the threshold; releasing earlier cancels them. Vertical scrolling never triggers a swipe.

![Swiping a task on a phone](./images/mobile-swipe-uk.jpg)

## ♿ Accessibility

- ⌨️ Every control is reachable and operable with the keyboard, with a visible focus ring, and a **Skip to tasks** link is the first stop for keyboard users.
- 🎯 Focus moves to a sensible place after completing, deleting, editing or restoring a task, and dialogs return focus to the button that opened them.
- 🏷️ List buttons announce their counters, the current list is marked with `aria-current`, toggles expose `aria-pressed`, the palette follows the ARIA combobox pattern and popovers are labelled dialogs.
- 🔊 Notifications, palette result counts and drag and drop steps are announced through live regions.
- 🌗 The interface respects reduced motion, reduced transparency, increased contrast and forced colours preferences — see [Design system](./design.md#-accessibility).
