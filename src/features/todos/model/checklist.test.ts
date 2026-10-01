import { describe, expect, it } from "vitest";

import { checklistProgress, parseChecklist, toggleChecklistItem } from "./checklist";

const NOTES = ["Packing list", "- [ ] Passport", "- [x] Tickets", "* [X] Charger", "- [ ]", "+ [ ] Snacks"].join("\n");

describe("parseChecklist", () => {
  it("reads markdown task list items with their line numbers", () => {
    expect(parseChecklist(NOTES)).toEqual([
      { line: 1, text: "Passport", done: false },
      { line: 2, text: "Tickets", done: true },
      { line: 3, text: "Charger", done: true },
      { line: 5, text: "Snacks", done: false },
    ]);
  });

  it("returns an empty list for plain notes", () => {
    expect(parseChecklist("Call before noon")).toEqual([]);
  });
});

describe("checklistProgress", () => {
  it("counts completed items", () => {
    expect(checklistProgress(NOTES)).toEqual({ done: 2, total: 4 });
    expect(checklistProgress("")).toEqual({ done: 0, total: 0 });
  });
});

describe("toggleChecklistItem", () => {
  it("flips the mark of one line and keeps the rest of the text", () => {
    const toggled = toggleChecklistItem(NOTES, 1);
    expect(toggled.split("\n")[1]).toBe("- [x] Passport");
    expect(toggleChecklistItem(toggled, 1)).toBe(NOTES);
    expect(toggleChecklistItem(NOTES, 3).split("\n")[3]).toBe("* [ ] Charger");
  });

  it("ignores lines that are not checklist items", () => {
    expect(toggleChecklistItem(NOTES, 0)).toBe(NOTES);
    expect(toggleChecklistItem(NOTES, 99)).toBe(NOTES);
  });
});
