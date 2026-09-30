export const APPEARANCES = ["system", "light", "dark"] as const;
export const ACCENTS = ["blue", "violet", "sunset", "forest", "graphite"] as const;

export type Appearance = (typeof APPEARANCES)[number];
export type Accent = (typeof ACCENTS)[number];

export interface ThemeSettings {
  appearance: Appearance;
  accent: Accent;
}

export const DEFAULT_THEME: ThemeSettings = { appearance: "system", accent: "blue" };

const THEME_COLORS: Record<"light" | "dark", string> = { light: "#e8edf6", dark: "#070a14" };

export const isAppearance = (value: unknown): value is Appearance =>
  typeof value === "string" && (APPEARANCES as readonly string[]).includes(value);

export const isAccent = (value: unknown): value is Accent =>
  typeof value === "string" && (ACCENTS as readonly string[]).includes(value);

export const resolveAppearance = (appearance: Appearance) => {
  if (appearance !== "system") return appearance;
  return globalThis.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
};

export const applyTheme = ({ appearance, accent }: ThemeSettings, root: HTMLElement = document.documentElement) => {
  root.dataset.appearance = appearance;
  root.dataset.accent = accent;
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", THEME_COLORS[resolveAppearance(appearance)]);
};
