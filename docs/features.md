# ✨ Features

## ✅ Tasks

| Action      | How                                                                                                                                                                                           |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ➕ Add      | Type in **Add a task** and press <kbd>Enter</kbd> or the arrow button. Whitespace is collapsed and titles are limited to 200 characters.                                                      |
| ✅ Complete | Click the circle. The check appears instantly and the task moves to **Completed** after a short pause — click again during the pause to change your mind.                                     |
| ✏️ Edit     | Double-click the title or press the pencil. <kbd>Enter</kbd> or the check button saves, <kbd>Esc</kbd> or the cross cancels, clicking elsewhere saves. An empty title keeps the original one. |
| 🗑️ Delete   | Press the trash button. The task can be restored from the notification that appears.                                                                                                          |
| ↕️ Reorder  | Drag the handle on the right of a task. Tasks are reordered within their own section.                                                                                                         |

New tasks appear at the top of **To do**. If the current filter or search would hide the new task, the app switches back to a view where it is visible.

### ⌨️ Reordering with the keyboard

1. Move focus to a task's handle with <kbd>Tab</kbd>.
2. Press <kbd>Space</kbd> or <kbd>Enter</kbd> to pick the task up.
3. Use the arrow keys to move it.
4. Press <kbd>Space</kbd> or <kbd>Enter</kbd> to drop it, or <kbd>Esc</kbd> to cancel.

Screen readers announce every step using the task titles.

## 🔎 Sections, filters and search

- 🗂️ Tasks are split into **To do** and **Completed**. The Completed section has a **Clear** button.
- 🎚️ The segmented control switches between **All**, **Active** and **Done** and shows live counters. The selected filter is remembered between visits.
- 🔎 The search button (or <kbd>/</kbd>) reveals a search field. Matching ignores letter case and diacritics, so `cafe` finds “Café” and `їжак` finds “ЇЖАК”. <kbd>Esc</kbd> clears the query, a second <kbd>Esc</kbd> closes the field.
- 🟢 The header shows a progress ring with the number of completed tasks.
- 🫙 Friendly empty states explain why the list is empty: no tasks yet, everything done, nothing completed or no search results.

## ↩️ Undo

Deleting a task or clearing completed tasks shows a notification for six seconds. The timer pauses while the pointer or keyboard focus is on the notification.

- ↩️ Press **Undo** or <kbd>⌘</kbd>/<kbd>Ctrl</kbd>+<kbd>Z</kbd> to restore the tasks exactly where they were.
- ✍️ The shortcut does not interfere with text fields, where it keeps its usual meaning.

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
  "version": 2,
  "exportedAt": "2026-09-30T10:00:00.000Z",
  "todos": [
    {
      "id": "V1StGXR8_Z5jdHi6B-myT",
      "title": "Book train tickets to Lviv",
      "completed": false,
      "createdAt": 1790755200000,
      "updatedAt": 1790755200000,
      "completedAt": null
    }
  ]
}
```

Importing never deletes anything:

- 🔁 tasks whose `id` already exists are skipped, new ones are appended to the list;
- 📄 a plain array of tasks is accepted as well as the full export;
- 🕰️ data from the first version of the app (`{ "id", "text", "isCompleted" }`) is converted automatically;
- 🚫 invalid entries are ignored and broken files are reported in a notification.

## 💾 Persistence and sync

- 💾 Tasks and the selected filter are saved to `localStorage` after every change.
- 🔄 Changes made in another tab of the same browser appear immediately.
- 🕰️ Data saved by the first version of the app under the `toDoList` key is migrated to the new format on first launch.

## 📱 Install and offline use

ToDo App is a Progressive Web App. Supporting browsers offer to install it, and after the first visit it keeps working without a network connection. New versions are installed in the background and used the next time the app is opened.

## ⌨️ Keyboard shortcuts

| Shortcut                                    | Action                       |
| ------------------------------------------- | ---------------------------- |
| <kbd>N</kbd>                                | Focus the new task field     |
| <kbd>/</kbd>                                | Open and focus search        |
| <kbd>⌘</kbd>/<kbd>Ctrl</kbd> + <kbd>Z</kbd> | Undo the last deletion       |
| <kbd>Enter</kbd> / <kbd>Esc</kbd>           | Save / cancel while editing  |
| <kbd>Esc</kbd>                              | Clear, then close the search |
| <kbd>Space</kbd> + arrows                   | Reorder with the drag handle |

Global shortcuts are ignored while you type in a text field.

## ♿ Accessibility

- ⌨️ Every control is reachable and operable with the keyboard, with a visible focus ring.
- 🎯 Focus is moved to a sensible place after completing, deleting, editing or restoring a task.
- 🔊 Notifications are announced through a polite live region.
- 🌗 The interface respects reduced motion, reduced transparency, increased contrast and forced colors preferences — see [Design system](./design.md#-accessibility).
