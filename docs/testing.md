# 🧪 Testing

## 🧰 Stack

| Tool                            | Role                                                  |
| ------------------------------- | ----------------------------------------------------- |
| ⚡ Vitest 5                     | Test runner, configured in `vite.config.ts`           |
| 🌐 jsdom 30                     | Browser-like environment                              |
| 🐙 Testing Library + user-event | Rendering components and simulating real interactions |
| 🧩 jest-dom                     | Readable DOM assertions such as `toHaveFocus()`       |
| 📊 `@vitest/coverage-v8`        | Coverage reports and thresholds                       |

## ▶️ Running tests

| Command                 | Mode                                    |
| ----------------------- | --------------------------------------- |
| `npm test`              | Watch mode                              |
| `npm run test:run`      | Single run                              |
| `npm run test:coverage` | Single run with coverage and thresholds |

The HTML coverage report is written to `coverage/index.html`.

## 🔺 Shape of the suite

```mermaid
flowchart TB
  UI["🖥️ UI flows · ~85 tests<br/>App, layouts, projects, planning, palette, context menu, calendar, details, rows, composer, back button"]
  Model["🧠 Model · ~200 tests<br/>slices, history, projects, data document, repeats, groups, selectors, thunks, drag and drop, quick add in 8 languages"]
  Lib["🧰 Shared helpers · ~30 tests<br/>dates and calendars, keyboard, fuzzy search, refraction, Trusted Types"]
  UI --> Model --> Lib
```

Most behaviour is pinned down by fast unit tests of pure functions and reducers; UI tests render the whole `App` and drive it like a user.

## 📁 Where tests live

Tests sit next to the code they cover as `*.test.ts(x)`:

| Area                                     | Files                                                                                    | Covers                                                                                                                                                           |
| ---------------------------------------- | ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 🚀 App                                   | `app/App.test.tsx`                                                                       | Shell without a header, smart lists, projects, the phone toolbar, tab bar and Lists sheet, settings, global search, back button, planning, menus, import, export |
|                                          | `app/persistence.test.ts`, `app/launch.test.ts`, `app/ErrorBoundary.test.tsx`            | Loading, migrations, missing projects, language detection, cross-tab sync, URL shortcuts, share target, recovery screen                                          |
| ✅ Todos model                           | `todo`, `todosSlice`, `repeat`, `selectors`, `thunks`, `quickAdd`, `checklist`           | Parsing and validation, every reducer, anchored repeats, counters and tags, drops on the sidebar, quick add grammar with repeats and `@project` mentions         |
| ✅ Todos UI                              | `TodoItem`, `TaskDetailsDialog`, `TodoComposer`, `TaskDnd/dnd`                           | Keyboard commands, the context menu with long press, swipes, chips, the details dialog, quick add recognition, collisions, drop rules and announcements          |
| 📁 Projects                              | `project.test.ts`, `projects/thunks.test.ts`                                             | Names and emoji icons, colours, parsing, creating and deleting with undo                                                                                         |
| 💾 Data                                  | `document`, `history`, `transfer`, `data/thunks`                                         | The stored document and its links, undo and redo of tasks and projects, import limits, export, merging imports                                                   |
| ⌘ Commands                               | `rank.test.ts`, `CommandPalette.test.tsx`                                                | Ranking and grouping, shortcut, arrow keys, running commands, projects, finding tasks                                                                            |
| 📚 Lists, 📊 stats, 🎨 settings, 🌍 i18n | `lists`, `groups`, `sort`, `stats/selectors`, `theme`, `settings`, `thunks`, `translate` | Smart lists and project views, date groups, sort orders, activity, streaks and project progress, backgrounds and glass, language switching, plurals              |
| 🧰 Shared                                | `date`, `keyboard`, `motion`, `refraction`, `text`, `trustedTypes`, `Calendar`           | Date keys, labels and week starts, shortcut matchers, transitions, displacement maths, fuzzy search, the URL policy, calendar keyboard navigation                |

## 🌐 Test environment

`src/test/setup.ts` prepares jsdom for the app:

- 🐢 **`matchMedia`** is mocked to report `prefers-reduced-motion: reduce`. The app then skips its delays, transitions and confetti, so tests never wait for animations. Individual tests can override it, for example to render the phone layout with the tab bar.
- 🪟 **Popover API**: jsdom hides `[popover]` elements but cannot open them. `src/test/popover.ts` adds `showPopover()`, `hidePopover()`, `togglePopover()` and `popovertarget` handling, and fires `beforetoggle` and `toggle` events like a browser, so menus that render their content lazily work in tests.
- 🌍 **Translations**: the setup preloads every language with `loadMessages()`, so tests can switch languages synchronously.
- 🗔 **Dialogs**: jsdom has no `showModal()`. `src/test/dialog.ts` implements `show()`, `showModal()` and `close()` with focus on the first control, focus restoration, the `close` event and <kbd>Esc</kbd> handling.
- 👆 **Pointer capture and scrolling**: `setPointerCapture()`, `releasePointerCapture()` and `scrollIntoView()` are stubbed, so swipe and palette tests run unchanged.
- 🧹 **Cleanup**: the DOM is unmounted and `localStorage` is cleared after every test.

## 🛠️ Helpers

| Helper                                                      | File                    | Purpose                                                              |
| ----------------------------------------------------------- | ----------------------- | -------------------------------------------------------------------- |
| `renderWithStore(ui, { preloadedState })`                   | `src/test/render.tsx`   | Renders with a fresh store and returns `{ store, user, ...queries }` |
| `renderApp(todos, list, projects)`                          | `src/test/render.tsx`   | Renders the whole app with the given todos, view and projects        |
| `openPopover(user, trigger)`                                | `src/test/render.tsx`   | Clicks a popover trigger and returns queries scoped to the panel     |
| `section(name)`, `itemTitles(region)`                       | `src/test/render.tsx`   | Finds a task section and lists the titles in it                      |
| `makeTodo()`, `makeProject()`, `makeState()`, `sampleTodos` | `src/test/factories.ts` | Consistent fixtures                                                  |
| `todayKey()`, `dayFromToday(offset)`                        | `src/test/factories.ts` | Due dates relative to the current day                                |

## 📐 Conventions

- 🎯 Query by role and accessible name (`getByRole("button", { name: "Delete “Buy milk”" })`). If an element is hard to find this way, it is probably hard to use with a screen reader too.
- 🖱️ Drive the UI with `userEvent`. Use `fireEvent` only for low-level input that user-event cannot express, such as touch swipes.
- 👀 Test behaviour, not implementation: assert on what the user sees or on the store, never on component state.
- 🌍 Assert translated text through `formatMessage(createTranslator(locale), message)` in model tests, so both languages are checked without rendering.
- 🫥 Popover content is in the DOM even while closed; scope queries with `openPopover()` or ignore it with `{ ignore: "[popover] *" }`.
- ⏱️ Long presses and other timers use `vi.useFakeTimers()` with `act()`, and real timers are restored at the end of the test.
- 🔢 Pure logic that a component needs, such as drop rules or collision detection, lives in a plain module next to it (`TaskDnd/dnd.ts`) so it can be tested without a browser.
- 🌐 Browser-only behaviour (refraction, pointer light, the backgrounds, dragging onto the sidebar, real CSP enforcement and rendering speed) is verified in Chrome; its pure logic is unit tested.

## 📊 Coverage thresholds

`npm run test:coverage` fails when coverage drops below:

| Metric     | Threshold |
| ---------- | --------- |
| Statements | 88 %      |
| Branches   | 85 %      |
| Functions  | 85 %      |
| Lines      | 88 %      |

The CI pipeline runs the same command and publishes a coverage table on the workflow summary page.
