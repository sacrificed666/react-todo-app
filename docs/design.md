# 🎨 Design system

The interface follows the ideas behind Apple's **Liquid Glass**: controls are made of a translucent material that blurs, tints and bends the content behind it, catches light on its edges and reacts to touch with fluid, springy motion. Everything is built with standard CSS and a small amount of SVG; the refraction layer is a progressive enhancement.

## 💡 Principles

- 🫧 **Controls float, content flows.** The composer, filters, search, buttons and overlays are glass; the backdrop gives them something to refract.
- ⭕ **Concentric shapes.** Capsules for controls, rounded rectangles for rows, inner radii derived from outer radii minus padding.
- 💡 **Light, not borders.** Edges are drawn by a specular rim and inner highlights rather than solid strokes.
- 🌊 **Motion with mass.** Transitions use spring curves; nothing snaps unless the user asked for reduced motion.

## 🌌 Backdrop

`components/layout/Backdrop` paints a fixed, decorative layer behind the app. It has four parts:

| Layer         | Implementation                                                                                                                                                            |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 🌑 Base       | Deep ink gradient (`#100d22` → `#08070f`) with a violet glow rising from the bottom                                                                                       |
| 🌌 Aurora     | Five large radial-gradient orbs — violet `#7a5cff`, rose `#ff4f93`, amber `#ff9f45`, teal `#1fd1c2`, blue `#3f6bff` — blended with `screen` and drifting on 38–50 s loops |
| 〰️ Flow lines | `src/assets/waves.svg`: 30 smooth contour curves generated from layered sine waves. Their crisp strokes make the refraction at glass edges visible                        |
| 🎞️ Grain      | A tiny tiled `feTurbulence` noise blended with `overlay`, which adds texture and prevents gradient banding                                                                |

The orbs only animate `translate` and `scale`, which the browser composites on the GPU. The animation stops completely when the user prefers reduced motion.

## 🔬 Anatomy of the glass material

The `glass()` mixin in `src/styles/_mixins.scss` builds every glass surface from the same layers:

1. 🎨 **Tint** — a translucent background colour (`--glass-tint`).
2. 🌫️ **Backdrop filter** — `blur()` → optional refraction → `saturate()` → `brightness()`.
3. ✨ **Specular rim** — a 1 px gradient ring drawn by `::before` with `mask-composite: exclude`.
4. 🔦 **Sheen and pointer light** — `::after` combines a soft top highlight with a radial light that follows the pointer (`--light-x`, `--light-y`, `--light-strength`, registered with `@property` so they animate smoothly).
5. 🌒 **Depth** — a two-part shadow plus inset highlights on the top and bottom edges.

```scss
.panel {
  @include glass(var(--radius-xl), var(--glass-tint-strong), var(--glass-blur-thick));
}
```

### 📏 Thickness levels

| Level      | Blur                          | Used for                                         | Refraction |
| ---------- | ----------------------------- | ------------------------------------------------ | ---------- |
| 🔘 Control | `--glass-blur-control` (8 px) | Composer, filter control, search field, progress | Yes        |
| 📄 Content | `--glass-blur` (14 px)        | Task rows, empty state, buttons, footer          | No         |
| 🪟 Overlay | `--glass-blur-thick` (28 px)  | Menu and notifications, with a darker tint       | Yes        |

Thin glass keeps the refraction readable, content glass keeps text legible over a busy backdrop, and thick glass makes overlays stand apart from what they cover.

## 🔍 Refraction

`lib/refraction.ts` and the `useLiquidGlass()` hook bend the backdrop near the edges of a surface, like light passing through the rounded rim of a glass lens.

1. The hook measures the element with a `ResizeObserver` and reads its corner radius.
2. `displacementAt()` computes, for every pixel, the signed distance to the rounded rectangle and the surface normal. Within the bezel (the outer 16–22 px) the displacement grows quadratically toward the edge and points inward.
3. The vectors are encoded into the red and green channels of a canvas image (128 means "no displacement"). Maps are cached by size, radius and bezel.
4. The map is plugged into an SVG `<filter>` with `feImage` and `feDisplacementMap` (`color-interpolation-filters="sRGB"` keeps the neutral value exact).
5. The element receives `--glass-refraction: url(#liquid-glass-N)`, which the mixin inserts into `backdrop-filter`.

Things worth knowing:

- 🌐 Only Chromium renders SVG filters inside `backdrop-filter`. The hook enables itself only there (and never when the user prefers reduced transparency); other browsers get the same glass without the lens.
- ⚠️ Chromium ignores `blur()` when it follows `url()` in a `backdrop-filter` chain, so the mixin always puts `blur()` first.
- 🧬 `--glass-refraction` is registered as a non-inherited custom property, so nested glass never picks up its parent's filter.
- 🎚️ Strength is tuned per component through `useLiquidGlass(ref, { bezel, scale })`, for example `{ bezel: 22, scale: 52 }` for the composer.

## 🎛️ Design tokens

Tokens live in `src/styles/_tokens.scss` as CSS custom properties.

| Group         | Tokens                                                                                                                                        |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| 🔤 Typography | `--font-sans`, `--font-display` — the system stack, which resolves to SF Pro on Apple devices                                                 |
| 🎨 Colour     | `--color-text`, `--color-text-secondary`, `--color-text-tertiary`, `--color-accent`, `--color-danger`, `--color-separator`, `--color-focus`   |
| 🫧 Glass      | `--glass-tint*`, `--glass-blur*`, `--glass-saturate`, `--glass-brightness`, `--glass-rim`, `--glass-sheen`, `--glass-edge`, `--glass-shadow*` |
| ⭕ Shape      | `--radius-sm` 12 px, `--radius-md` 16 px, `--radius-lg` 22 px, `--radius-xl` 28 px, `--radius-full`                                           |
| 🌊 Motion     | `--ease-out`, `--ease-in-out`, `--ease-spring`, `--ease-bounce`, `--duration-fast`, `--duration-base`, `--duration-slow`                      |
| 📐 Layout     | `--content-width` (42 rem)                                                                                                                    |

## 🌊 Motion

The two spring curves are sampled from a damped harmonic oscillator and expressed with the CSS `linear()` function:

| Token           | Damping ratio | Overshoot | Typical use                              |
| --------------- | ------------- | --------- | ---------------------------------------- |
| `--ease-spring` | 0.82          | ≈ 1 %     | Indicators, rows entering, notifications |
| `--ease-bounce` | 0.58          | ≈ 11 %    | Presses on buttons and checkboxes        |

Notable interactions:

- 💧 **Liquid segmented control** — the selected pill moves its leading edge first and its trailing edge 70 ms later, so it stretches like a droplet before settling.
- 🌱 **Entering rows** fade and scale in with `@starting-style`.
- 🍂 **Leaving rows** fade out while their grid track collapses from `1fr` to `0fr`, letting neighbours glide into place.
- 👆 **Glass presses** — glass buttons grow slightly and brighten when pressed, as the material "flexes".
- 📋 **Menu** — a native popover positioned with CSS anchor positioning (with a JavaScript fallback) that scales in from the button.

## ♿ Accessibility

| Preference                                | Adaptation                                                                    |
| ----------------------------------------- | ----------------------------------------------------------------------------- |
| 🐢 `prefers-reduced-motion: reduce`       | Durations drop to 1 ms, the aurora stops, completion and deletion are instant |
| 🌫️ `prefers-reduced-transparency: reduce` | Surfaces become opaque, blur and refraction are disabled                      |
| 🌗 `prefers-contrast: more`               | Stronger text, separators and rims, denser glass                              |
| 🖍️ `forced-colors: active`                | Glass gains a real border and checkboxes use system colours                   |

Additionally:

- 🎯 focus is always visible through a 2 px ring;
- 👆 touch devices get 40 px hit targets for the row actions and always-visible controls;
- 🔤 text on glass uses a warm off-white with at least 70 % opacity for secondary text.

## 🖼️ Iconography

Icons are inline SVG paths drawn on a 24 px grid with 2 px round strokes, in the spirit of SF Symbols (`components/ui/Icon/icons.ts`). They inherit `currentColor` and scale with `font-size`.

The app icon repeats the backdrop in miniature — aurora glow, flow lines and a glass disc with a check mark — and ships as an SVG favicon, a multi-size ICO, PWA icons and a maskable variant.
