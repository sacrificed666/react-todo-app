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

## 📁 Where tests live

Tests sit next to the code they cover:

| File                                  | Covers                                                                                                                  |
| ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `src/App.test.tsx`                    | End-to-end user flows: adding, completing, editing, deleting, undo, filters, search, shortcuts, menu, import and export |
| `src/store/slices/todosSlice.test.ts` | Every reducer, including reordering and restoring positions                                                             |
| `src/store/selectors.test.ts`         | Counters, filtering, search and memoization                                                                             |
| `src/store/thunks.test.ts`            | Adding, removal with undo, clearing and importing                                                                       |
| `src/store/persistence.test.ts`       | Loading, legacy migration, corrupted data, saving and cross-tab sync                                                    |
| `src/lib/todo.test.ts`                | Title normalization, search matching and data parsing                                                                   |
| `src/lib/refraction.test.ts`          | Displacement maths and feature detection                                                                                |
| `src/lib/keyboard.test.ts`            | Shortcut matching and editable targets                                                                                  |
| `src/lib/motion.test.ts`              | Waiting for transitions and the safety timeout                                                                          |

## 🌐 Test environment

`src/test/setup.ts` prepares jsdom for the app:

- 🐢 **`matchMedia`** is mocked to report `prefers-reduced-motion: reduce`. The app then skips its delays and transitions, so tests never wait for animations.
- 🪟 **Popover API** — jsdom hides `[popover]` elements but cannot open them. `src/test/popover.ts` adds `showPopover()`, `hidePopover()`, `togglePopover()` and `popovertarget` handling, so tests open the menu exactly like a user.
- 🧹 **Cleanup** — the DOM is unmounted and `localStorage` is cleared after every test.

Helpers:

- 🏗️ `renderWithStore(ui, { preloadedState })` in `src/test/render.tsx` renders with a fresh store and returns `{ store, user, ...queries }`.
- 🏭 `makeTodo()`, `makeState()` and `sampleTodos` in `src/test/factories.ts` build consistent fixtures.

## 📐 Conventions

- 🎯 Query by role and accessible name (`getByRole("button", { name: "Delete “Buy milk”" })`). If an element is hard to find this way, it is probably hard to use with a screen reader too.
- 🖱️ Drive the UI with `userEvent`, not `fireEvent`.
- 👀 Test behaviour, not implementation: assert on what the user sees or on the store, never on component state.
- ⚡ Keep reducers and helpers covered by fast unit tests, and use `App.test.tsx` for flows that cross components.
- 🌐 Browser-only effects (refraction, pointer light, the aurora) are verified visually; their pure logic, such as `displacementAt()`, is unit tested.

## 📊 Coverage thresholds

`npm run test:coverage` fails when coverage drops below:

| Metric     | Threshold |
| ---------- | --------- |
| Statements | 80 %      |
| Branches   | 75 %      |
| Functions  | 80 %      |
| Lines      | 80 %      |

The CI pipeline runs the same command and publishes a coverage table on the workflow summary page.
