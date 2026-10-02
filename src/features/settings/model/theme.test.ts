import { describe, expect, it } from "vitest";

import { applyTheme, isAccent, isAppearance, isBackdrop, isGlassStyle, resolveAppearance } from "./theme";

describe("theme", () => {
  it("validates settings", () => {
    expect(isAppearance("light")).toBe(true);
    expect(isAppearance("sepia")).toBe(false);
    expect(isAccent("forest")).toBe(true);
    expect(isAccent("mint")).toBe(true);
    expect(isAccent("magenta")).toBe(false);
    expect(isBackdrop("nebula")).toBe(true);
    expect(isBackdrop("photo")).toBe(false);
    expect(isGlassStyle("tinted")).toBe(true);
    expect(isGlassStyle("frosted")).toBe(false);
  });

  it("resolves the system appearance", () => {
    expect(resolveAppearance("light")).toBe("light");
    expect(resolveAppearance("system")).toBe("dark");
  });

  it("applies settings to the document", () => {
    const meta = document.createElement("meta");
    meta.name = "theme-color";
    document.head.append(meta);

    applyTheme({ appearance: "light", accent: "sunset", backdrop: "ocean", glass: "tinted" });

    expect(document.documentElement.dataset).toMatchObject({
      appearance: "light",
      accent: "sunset",
      backdrop: "ocean",
      glass: "tinted",
    });
    expect(meta.content).toBe("#e8edf6");
    meta.remove();
  });
});
