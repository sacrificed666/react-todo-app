import { describe, expect, it } from "vitest";

import { getMessages } from "./catalog";
import { en } from "./messages/en";
import { detectLocale, isLocale, LOCALES, pluralCategory, translate } from "./translate";

describe("translate", () => {
  it("interpolates parameters with each language's quotes", () => {
    expect(translate("en", "todo.delete", { title: "Milk" })).toBe("Delete “Milk”");
    expect(translate("uk", "todo.delete", { title: "Молоко" })).toBe("Видалити «Молоко»");
    expect(translate("de", "todo.delete", { title: "Milch" })).toBe("„Milch“ löschen");
    expect(translate("fr", "todo.delete", { title: "Lait" })).toBe("Supprimer «\u00a0Lait\u00a0»");
    expect(translate("pl", "todo.delete", { title: "Mleko" })).toBe("Usuń „Mleko”");
  });

  it("keeps unknown placeholders untouched", () => {
    expect(translate("en", "todo.delete")).toBe("Delete “{title}”");
  });

  it("selects plural forms", () => {
    expect(translate("en", "footer.tasks", { count: 1 })).toBe("1 task");
    expect(translate("en", "footer.tasks", { count: 3 })).toBe("3 tasks");
    expect(translate("uk", "footer.tasks", { count: 3 })).toBe("3 завдання");
    expect(translate("uk", "footer.tasks", { count: 5 })).toBe("5 завдань");
    expect(translate("uk", "footer.tasks", { count: 21 })).toBe("21 завдання");
    expect(translate("pl", "footer.tasks", { count: 1 })).toBe("1 zadanie");
    expect(translate("pl", "footer.tasks", { count: 3 })).toBe("3 zadania");
    expect(translate("pl", "footer.tasks", { count: 12 })).toBe("12 zadań");
    expect(translate("pl", "footer.tasks", { count: 22 })).toBe("22 zadania");
    expect(translate("fr", "footer.tasks", { count: 0 })).toBe("0 tâche");
    expect(translate("fr", "footer.tasks", { count: 2 })).toBe("2 tâches");
    expect(translate("de", "footer.tasks", { count: 1 })).toBe("1 Aufgabe");
    expect(translate("it", "footer.tasks", { count: 7 })).toBe("7 attività");
  });

  it("detects the first supported browser language", () => {
    expect(detectLocale(["uk-UA", "en-US"])).toBe("uk");
    expect(detectLocale(["de-DE", "en-US"])).toBe("de");
    expect(detectLocale(["pt-BR", "es-419"])).toBe("es");
    expect(detectLocale(["pt-BR"])).toBe("en");
    expect(isLocale("pl")).toBe(true);
    expect(isLocale("pt")).toBe(false);
  });

  it("translates every message in every language", () => {
    const keys = Object.keys(en).toSorted();
    for (const locale of LOCALES) expect(Object.keys(getMessages(locale)).toSorted()).toEqual(keys);
  });

  it("spells out every plural form a language needs", () => {
    const missing = LOCALES.flatMap((locale) =>
      Object.entries(getMessages(locale)).flatMap(([key, message]) => {
        if (typeof message === "string") return [];
        return Array.from({ length: 200 }, (_, count) => pluralCategory(locale, count))
          .filter((category) => message[category] === undefined)
          .map((category) => `${locale} ${key} ${category}`);
      }),
    );
    expect([...new Set(missing)]).toEqual([]);
  });
});
