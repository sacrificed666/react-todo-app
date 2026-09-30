# 🤝 Contributing

## 🔄 Workflow

1. 🌿 Create a branch from `main`.
2. ✅ Make your changes and run `npm run check`.
3. 📬 Open a pull request. The pipeline lints, type-checks, tests, builds and reviews new dependencies.
4. 🚀 Merge once everything is green — `main` deploys automatically.

## 🧹 Code style

Formatting and linting are automated, so reviews can focus on behaviour.

- 🎨 **Oxfmt** formats TypeScript, SCSS, JSON, YAML, HTML and Markdown with a print width of 120 and sorts imports into groups. Run `npm run format`.
- 🧹 **Oxlint** enables the `correctness`, `suspicious` and `perf` categories together with type-aware TypeScript rules, React hooks and React Compiler rules, `jsx-a11y`, `import`, `unicorn` and `vitest` plugins. Run `npm run lint`.
- 🔷 **TypeScript** runs in strict mode with `noUncheckedIndexedAccess`, `verbatimModuleSyntax` and `erasableSyntaxOnly`.

### 🚫 No comments

The codebase contains no comments: names, small functions and types carry the intent instead. The rule is enforced by a custom Oxlint plugin in `lint/no-comments.js` (`local/no-comments`), which reports every comment in JavaScript and TypeScript files, including `eslint-disable`-style directives. Styles, configuration and workflow files follow the same convention. If something needs explanation, prefer a better name, an extracted function or documentation in `docs/`.

### 📐 Conventions

| Topic               | Convention                                                                                                                                       |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| 🧩 Components       | One folder per component: `ComponentName/ComponentName.tsx` and `ComponentName.module.scss`, arrow functions, default export                     |
| 🪝 Hooks            | `useSomething.ts` in `src/hooks`                                                                                                                 |
| 🧰 Helpers          | Framework-free code in `src/lib`, covered by unit tests                                                                                          |
| 🗃️ Redux            | Past-tense action names (`todoAdded`), pure reducers, timestamps in `prepare` callbacks, side effects in thunks                                  |
| 🎨 Styles           | Tokens from `_tokens.scss`, the `glass()`, `hover`, `pressable` and `visually-hidden` mixins, logical properties (`inline-size`, `margin-block`) |
| 📥 Imports          | Use the `@/` alias for anything outside the current folder                                                                                       |
| 🏷️ State attributes | Use `data-*` attributes (`data-completed`, `data-leaving`) for visual states instead of extra class names                                        |

### 🫧 Adding a glass surface

```tsx
const Panel = () => {
  const ref = useRef<HTMLDivElement>(null);
  useLiquidGlass(ref, { bezel: 18, scale: 40 });
  return <div ref={ref} className={styles.panel} data-glass-light="" />;
};
```

```scss
@use "@/styles/mixins" as *;

.panel {
  @include glass(var(--radius-xl), $blur: var(--glass-blur-control));
}
```

`useLiquidGlass()` is optional: skip it for surfaces that repeat many times, such as list rows. `data-glass-light` enables the pointer highlight.

## 📝 Commit messages

Commits follow [Conventional Commits](https://www.conventionalcommits.org/):

```text
feat: add keyboard reordering
fix(store): keep undo positions after import
style: refine glass rim
ci: cache npm downloads
docs: describe the refraction pipeline
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
