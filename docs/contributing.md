# 🤝 Contributing

## 🔄 Workflow

```mermaid
flowchart LR
  Branch[🌿 Branch from main] --> Code[✏️ Change + tests + docs]
  Code --> Check[✅ npm run check]
  Check --> E2E[🎭 npm run test:e2e]
  E2E --> PR[📬 Pull request]
  PR --> CI[🔍 CI · 🎭 E2E · 🔬 CodeQL · 🛡️ dependency review]
  CI --> Merge[🔀 Merge]
  Merge --> Deploy[🚀 Automatic deploy]
```

1. 🌿 Create a branch from `main`.
2. ✅ Make your changes, add tests and run `npm run check`.
3. 🎭 For anything people see, run `npm run test:e2e` as well: it covers the production build, offline mode, the Content Security Policy, accessibility and the Lighthouse budget.
4. 📬 Open a pull request and fill in the checklist from the template.
5. 🚀 Merge once everything is green. `main` deploys automatically.

Bugs and ideas go through the issue forms in `.github/ISSUE_TEMPLATE`; security problems are reported privately as described in the [security policy](../.github/SECURITY.md).

## 🧹 Code style

Formatting and linting are automated, so reviews can focus on behaviour.

- 🎨 **Oxfmt** formats TypeScript, SCSS, JSON, YAML, HTML and Markdown with a print width of 120 and sorts imports into groups. Run `npm run format`.
- 🧹 **Oxlint** enables the `correctness`, `suspicious` and `perf` categories together with type-aware TypeScript rules, React hooks and React Compiler rules, `jsx-a11y`, `import`, `unicorn` and `vitest` plugins, plus the layer rules described below. Run `npm run lint`.
- 🔷 **TypeScript** runs in strict mode with `noUncheckedIndexedAccess`, `verbatimModuleSyntax` and `erasableSyntaxOnly`.

### 🚫 No comments

> [!IMPORTANT]
> The codebase contains no comments: names, small functions and types carry the intent instead. A custom Oxlint plugin in `lint/no-comments.js` (`local/no-comments`) reports every comment in JavaScript and TypeScript files, including `eslint-disable`-style directives.
> Styles, configuration, workflow files and templates follow the same convention. If something needs explanation, prefer a better name, an extracted function or documentation in `docs/`.

### 🧭 Where code goes

| You are adding…                                    | Put it in                                             |
| -------------------------------------------------- | ----------------------------------------------------- |
| A reducer, selector, thunk or domain helper        | `src/features/<feature>/model/`                       |
| A component that reads or changes the store        | `src/features/<feature>/ui/<Component>/`              |
| A region composed of several features              | `src/widgets/<Widget>/`                               |
| A reusable component, hook or helper without state | `src/shared/ui`, `src/shared/hooks`, `src/shared/lib` |
| Startup, persistence or browser integration        | `src/app/`                                            |
| A text                                             | Every catalog in `src/features/i18n/model/messages/`  |
| A browser scenario                                 | `e2e/*.spec.ts`, with helpers in `e2e/helpers.ts`     |

> [!WARNING]
> Imports only point downwards: `app → widgets → features → shared`. Features and widgets may use `useAppDispatch`, `useAppSelector` and the store **types** from `@/app`, nothing else. Oxlint fails the build for any other direction.

### 📐 Conventions

| Topic               | Convention                                                                                                                                          |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| 🧩 Components       | One folder per component: `ComponentName/ComponentName.tsx` and `ComponentName.module.scss`, arrow functions, default export                        |
| 🪝 Hooks            | `useSomething.ts` next to the feature that owns it, or in `src/shared/hooks` when it is generic                                                     |
| 🗃️ Redux            | Past-tense action names (`todoAdded`), pure reducers, timestamps and ids in `prepare` callbacks, side effects in thunks                             |
| 🌍 Texts            | Never hard-code UI text. Add a key to all eight catalogs and use `t()`; notifications store `{ key, params }`, see [Localization](./i18n.md)        |
| 🎨 Styles           | Tokens from `_tokens.scss`, the `glass()`, `hover`, `pressable` and `visually-hidden` mixins, logical properties (`inline-size`, `margin-block`)    |
| 📥 Imports          | Use the `@/` alias for anything outside the current feature, relative paths inside it                                                               |
| 🏷️ State attributes | Use `data-*` attributes (`data-completed`, `data-leaving`, `data-swipe`) for visual states instead of extra class names                             |
| ♿ Names            | Every accessible name contains the visible label; when an `aria-label` adds a counter, keep a space between the label and the counter in the markup |
| 🧪 Tests            | Next to the code as `*.test.ts(x)`; query by role and accessible name                                                                               |

### 🫧 Adding a glass surface

```tsx
const Panel = () => {
  const ref = useRef<HTMLDivElement>(null);
  useRefraction(ref, { bezel: 18, scale: 40 });
  return <div ref={ref} className={styles.panel} data-glass-light="" />;
};
```

```scss
@use "@/shared/styles/mixins" as *;

.panel {
  @include glass(var(--radius-xl), $blur: var(--glass-blur-control));
}
```

`useRefraction()` is optional: skip it for surfaces that repeat many times, such as list rows. `data-glass-light` enables the pointer highlight.

Two rules keep the rim where it belongs:

- 📜 **The glass never scrolls itself.** The rim (`::before`) and the sheen (`::after`) are absolutely positioned, so a scrolling surface would carry them away with its content. Let an inner element scroll instead, the way `Dialog`, `Popover`, `ContextMenu` and the details panel do with their `.body`.
- 📌 **Top-layer surfaces are `position: fixed`.** The mixin sets `position: relative`, which the browser turns into `absolute` for a modal dialog or a popover, pinning it to the top of the document instead of the screen. Set `position: fixed` after the `@include`.

### ⌘ Adding a command to the palette

Commands are plain objects. Commands that also belong in the **⋯** menu (undo, redo, bulk actions, export) are defined once in `features/commands/model/useTaskCommands.ts` with a `disabled` state; navigation, project and appearance commands are built in `CommandPalette.tsx`:

```ts
{
  id: "settings",
  group: "appearance",
  label: t("palette.openSettings"),
  keywords: "preferences options",
  icon: "sliders",
  run: () => dispatch(overlayOpened({ kind: "settings" })),
}
```

Give it a translated `label`, optional `keywords` for fuzzy matching and a `hint` for its keyboard shortcut. `rankCommands()` takes care of filtering, ordering and grouping.

### 🪟 Adding a dialog or sheet

Modal surfaces are described by `view.overlay`, so only one is open at a time and the **Back** button can close it:

1. Add a kind to the `Overlay` union in `features/lists/model/viewSlice.ts`.
2. Render a `Dialog` whose `open` is `selectOverlayKind(state) === "your-kind"` and whose `onClose` dispatches `overlayClosed("your-kind")`.
3. Open it with `overlayOpened({ kind: "your-kind" })` from a button or a palette command.

On phones `Dialog` turns into a bottom sheet automatically. Pass a `header` to keep a title and its buttons in place while the content scrolls and fades out beneath them, as the settings do.

## 📝 Commit messages

Commits follow [Conventional Commits](https://www.conventionalcommits.org/):

```text
feat(palette): add sort commands
fix(todos): keep undo positions after import
style: refine glass rim
ci: verify npm registry signatures
docs: describe the update flow
chore(deps): update vite to 8.4
```

| Type          | Use it for                         |
| ------------- | ---------------------------------- |
| ✨ `feat`     | A new feature                      |
| 🐛 `fix`      | A bug fix                          |
| ♻️ `refactor` | Code changes without new behaviour |
| 💄 `style`    | Visual and styling changes         |
| ✅ `test`     | Adding or updating tests           |
| 📝 `docs`     | Documentation                      |
| 👷 `ci`       | Pipeline and automation            |
| 🔧 `chore`    | Dependencies and maintenance       |
