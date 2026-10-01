import { describe, expect, it } from "vitest";

import { en } from "./messages/en";
import { uk } from "./messages/uk";
import { detectLocale, isLocale, translate } from "./translate";

describe("translate", () => {
  it("interpolates parameters", () => {
    expect(translate("en", "todo.delete", { title: "Milk" })).toBe("Delete “Milk”");
    expect(translate("uk", "todo.delete", { title: "Молоко" })).toBe("Видалити «Молоко»");
  });

  it("keeps unknown placeholders untouched", () => {
    expect(translate("en", "todo.delete")).toBe("Delete “{title}”");
  });

  it("selects English plural forms", () => {
    expect(translate("en", "footer.tasks", { count: 1 })).toBe("1 task");
    expect(translate("en", "footer.tasks", { count: 3 })).toBe("3 tasks");
  });

  it("selects Ukrainian plural forms", () => {
    expect(translate("uk", "footer.tasks", { count: 1 })).toBe("1 завдання");
    expect(translate("uk", "footer.tasks", { count: 3 })).toBe("3 завдання");
    expect(translate("uk", "footer.tasks", { count: 5 })).toBe("5 завдань");
    expect(translate("uk", "footer.tasks", { count: 21 })).toBe("21 завдання");
  });

  it("detects the preferred locale", () => {
    expect(detectLocale(["uk-UA", "en-US"])).toBe("uk");
    expect(detectLocale(["de-DE", "en-US"])).toBe("en");
    expect(isLocale("uk")).toBe(true);
    expect(isLocale("pl")).toBe(false);
  });

  it("translates every message", () => {
    expect(Object.keys(uk).toSorted()).toEqual(Object.keys(en).toSorted());
  });
});
