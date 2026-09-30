# ✨ Features

## 🧭 Layout

| Area           | What it contains                                                                                                   |
| -------------- | ------------------------------------------------------------------------------------------------------------------ |
| 🔝 Header      | A full-width glass bar that stays on top: logo, search, appearance menu and the **⋯** actions menu                 |
| 📚 Sidebar     | Smart lists with live counters and an **Overview** card with overall progress, overdue, today and important counts |
| 📝 Main column | The list title with today's date and progress, the sort menu, the task composer and the task list                  |
| 🔚 Footer      | A full-width status bar with task totals, overdue count, author, source link and app version                       |

On screens narrower than 900 px the sidebar turns into a horizontally scrollable row of list chips, and below 720 px the search field moves behind a search button in the header.

## 📚 Smart lists

| List         | Shows                                                        | Shortcut     |
| ------------ | ------------------------------------------------------------ | ------------ |
| 📥 All tasks | Every task, with completed ones in a collapsible section     | <kbd>1</kbd> |
| ☀️ Today     | Tasks due today or overdue, plus the ones you finished today | <kbd>2</kbd> |
| 📅 Upcoming  | Tasks due after today                                        | <kbd>3</kbd> |
| ⭐ Important | Starred tasks                                                | <kbd>4</kbd> |
| ✅ Completed | Everything you have finished                                 | <kbd>5</kbd> |

- 🔢 Counters show how many active tasks each list holds; the **Today** counter turns red when something is overdue.
- 🎯 New tasks inherit the context of the list: in **Today** they are due today, in **Upcoming** tomorrow, in **Important** they are starred. You can change this before adding.
- 🔁 If a new task would not belong to the current list, the app switches to **All tasks** so you can see it.
- 💾 The selected list is remembered between visits.

## ✅ Tasks

| Action      | How                                                                                                                                                            |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ➕ Add      | Type in **Add a task** and press <kbd>Enter</kbd> or the arrow button. Pick a due date with the calendar chip and star it with ☆ before adding.                |
| ✅ Complete | Click the circle. The check appears instantly and the task moves to **Completed** after a short pause — click again during the pause to undo it.               |
| ✏️ Edit     | Click the title. <kbd>Enter</kbd> or the check button saves, <kbd>Esc</kbd> or the cross cancels, clicking elsewhere saves. An empty title keeps the original. |
| ⭐ Star     | Press ☆ on a task. Starred tasks keep a filled star and appear in **Important**.                                                                               |
| 📅 Schedule | Press the calendar button on a task and choose **Today**, **Tomorrow**, **Next week**, a custom date or **Remove date**.                                       |
| 🗑️ Delete   | Press the trash button. The task can be restored from the notification.                                                                                        |
| ↕️ Reorder  | Drag the handle on the right of a task. Reordering is available with the **Manual** sort order.                                                                |

Due dates are shown as friendly labels — **Today**, **Tomorrow**, **Yesterday**, a weekday for the next few days or a short date — and are coloured: 🔴 overdue, 🟠 today, 🔵 later.

When starring, scheduling or completing moves a task out of the current list, it glides out of view instead of disappearing abruptly.

### ⌨️ Reordering with the keyboard

1. Move focus to a task's handle with <kbd>Tab</kbd>.
2. Press <kbd>Space</kbd> or <kbd>Enter</kbd> to pick the task up.
3. Use the arrow keys to move it.
4. Press <kbd>Space</kbd> or <kbd>Enter</kbd> to drop it, or <kbd>Esc</kbd> to cancel.

Screen readers announce every step using the task titles.

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

## 🔎 Search and completed tasks

- 🔎 Search from the header or press <kbd>/</kbd>. Matching ignores letter case and diacritics, so `cafe` finds “Café” and `їжак` finds “ЇЖАК”. <kbd>Esc</kbd> clears the query, a second <kbd>Esc</kbd> leaves the field.
- 🗂️ The **Completed** section can be collapsed with its chevron; the choice is remembered. **Clear** removes all completed tasks.
- 🎉 When every task in a list is done, a small **All done** card replaces the empty list.
- 🫙 Every list has its own empty state that explains what belongs there.

## ↩️ Undo

Deleting a task or clearing completed tasks shows a notification for six seconds. The timer pauses while the pointer or keyboard focus is on the notification.

- ↩️ Press **Undo** or <kbd>⌘</kbd>/<kbd>Ctrl</kbd>+<kbd>Z</kbd> to restore the tasks exactly where they were.
- ✍️ The shortcut does not interfere with text fields, where it keeps its usual meaning.

## 🎨 Appearance

The palette button in the header opens the appearance menu:

- 🌗 **Auto**, **Light** or **Dark** colour scheme — Auto follows the operating system and switches live.
- 🎨 Five accent colours — 🔵 Ocean blue, 🟣 Aurora violet, 🟠 Sunset, 🟢 Forest and ⚪ Graphite. The accent tints checkboxes, buttons, progress bars and the animated backdrop.
- 💾 Both choices are saved and applied before the first paint, so the app never flashes the wrong theme.

## 🧰 More actions menu

The **⋯** button opens a menu with:

- ✅ **Complete all** or **Mark all as active**, depending on the current state
- 🧹 **Clear completed**
- 📤 **Export tasks** — downloads `todos-YYYY-MM-DD.json`
- 📥 **Import tasks** — merges tasks from a JSON file
- ⌨️ A cheat sheet of keyboard shortcuts (hidden on touch-only devices)

## 🔄 Import and export

Exported files look like this:

```json
{
  "app": "react-todo-app",
  "version": 3,
  "exportedAt": "2026-10-01T10:00:00.000Z",
  "todos": [
    {
      "id": "V1StGXR8_Z5jdHi6B-myT",
      "title": "Book train tickets to Lviv",
      "completed": false,
      "important": true,
      "dueDate": "2026-10-02",
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
- 🕰️ files from earlier versions — without `important` and `dueDate`, or in the first `{ "id", "text", "isCompleted" }` format — are converted automatically;
- 🚫 invalid entries and dates are ignored and broken files are reported in a notification.

## 💾 Persistence and sync

- 💾 Tasks, the selected list, sort order, the completed section state and appearance are saved to `localStorage` after every change.
- 🔄 Changes made in another tab of the same browser appear immediately.
- 🕰️ Data saved by earlier versions of the app is migrated to the new format on first launch.

## 📱 Install and offline use

ToDo App is a Progressive Web App. Supporting browsers offer to install it, and after the first visit it keeps working without a network connection. New versions are installed in the background and used the next time the app is opened.

## ⌨️ Keyboard shortcuts

| Shortcut                                    | Action                       |
| ------------------------------------------- | ---------------------------- |
| <kbd>N</kbd>                                | Focus the new task field     |
| <kbd>/</kbd>                                | Open and focus search        |
| <kbd>1</kbd> – <kbd>5</kbd>                 | Switch between smart lists   |
| <kbd>⌘</kbd>/<kbd>Ctrl</kbd> + <kbd>Z</kbd> | Undo the last deletion       |
| <kbd>Enter</kbd> / <kbd>Esc</kbd>           | Save / cancel while editing  |
| <kbd>Esc</kbd>                              | Clear, then leave the search |
| <kbd>Space</kbd> + arrows                   | Reorder with the drag handle |

Global shortcuts are ignored while you type in a text field.

## ♿ Accessibility

- ⌨️ Every control is reachable and operable with the keyboard, with a visible focus ring.
- 🎯 Focus moves to a sensible place after completing, deleting, editing or restoring a task.
- 🏷️ List buttons announce their counters, the current list is marked with `aria-current`, toggles expose `aria-pressed` and popovers are labelled dialogs.
- 🔊 Notifications are announced through a polite live region.
- 🌗 The interface respects reduced motion, reduced transparency, increased contrast and forced colours preferences — see [Design system](./design.md#-accessibility).
