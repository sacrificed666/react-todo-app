export const APPEARANCES = ["system", "light", "dark"] as const;
export const ACCENTS = [
  "blue",
  "indigo",
  "violet",
  "pink",
  "rose",
  "sunset",
  "amber",
  "forest",
  "mint",
  "graphite",
] as const;
export const BACKDROPS = ["aurora", "spectrum", "sunset", "ocean", "nebula", "plain"] as const;
export const GLASS_STYLES = ["clear", "tinted"] as const;

export type Appearance = (typeof APPEARANCES)[number];
export type Accent = (typeof ACCENTS)[number];
export type Backdrop = (typeof BACKDROPS)[number];
export type GlassStyle = (typeof GLASS_STYLES)[number];

export interface ThemeSettings {
  appearance: Appearance;
  accent: Accent;
  backdrop: Backdrop;
  glass: GlassStyle;
}

export const DEFAULT_THEME: ThemeSettings = {
  appearance: "system",
  accent: "blue",
  backdrop: "aurora",
  glass: "clear",
};

const THEME_COLORS: Record<"light" | "dark", string> = { light: "#e8edf6", dark: "#070a14" };

const isOneOf =
  <Value extends string>(values: readonly Value[]) =>
  (value: unknown): value is Value =>
    typeof value === "string" && (values as readonly string[]).includes(value);

export const isAppearance = isOneOf(APPEARANCES);
export const isAccent = isOneOf(ACCENTS);
export const isBackdrop = isOneOf(BACKDROPS);
export const isGlassStyle = isOneOf(GLASS_STYLES);

export const resolveAppearance = (appearance: Appearance) => {
  if (appearance !== "system") return appearance;
  return globalThis.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
};

export const applyTheme = (
  { appearance, accent, backdrop, glass }: ThemeSettings,
  root: HTMLElement = document.documentElement,
) => {
  root.dataset.appearance = appearance;
  root.dataset.accent = accent;
  root.dataset.backdrop = backdrop;
  root.dataset.glass = glass;
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", THEME_COLORS[resolveAppearance(appearance)]);
};
