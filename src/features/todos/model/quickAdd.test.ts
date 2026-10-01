import { describe, expect, it } from "vitest";

import { parseDatePhrase, parseQuickAdd } from "./quickAdd";

const today = "2026-10-01";

describe("parseQuickAdd", () => {
  it("recognises relative dates at the end of the title", () => {
    expect(parseQuickAdd("Call mom tomorrow", today)).toEqual({
      title: "Call mom",
      dueDate: "2026-10-02",
      important: false,
    });
    expect(parseQuickAdd("Подзвонити мамі завтра", today).dueDate).toBe("2026-10-02");
    expect(parseQuickAdd("Renew passport in 10 days", today).dueDate).toBe("2026-10-11");
    expect(parseQuickAdd("Оплатити рахунки через 3 дні", today).dueDate).toBe("2026-10-04");
  });

  it("recognises weekdays", () => {
    expect(parseQuickAdd("Team retro on friday", today).dueDate).toBe("2026-10-02");
    expect(parseQuickAdd("Standup thursday", today).dueDate).toBe("2026-10-08");
    expect(parseQuickAdd("Зустріч у п'ятницю", today)).toMatchObject({ title: "Зустріч", dueDate: "2026-10-02" });
    expect(parseQuickAdd("Звіт наступного вівторка", today)).toMatchObject({ title: "Звіт", dueDate: "2026-10-06" });
    expect(parseQuickAdd("Йога наступної середи", today).dueDate).toBe("2026-10-07");
    expect(parseQuickAdd("Похід цієї суботи", today).dueDate).toBe("2026-10-03");
    expect(parseQuickAdd("Ремонт наступний понеділок", today).dueDate).toBe("2026-10-05");
  });

  it("recognises explicit dates", () => {
    expect(parseQuickAdd("Dentist 2026-11-03", today).dueDate).toBe("2026-11-03");
    expect(parseQuickAdd("Day off 24.12", today).dueDate).toBe("2026-12-24");
    expect(parseQuickAdd("Book tickets 15.09", today).dueDate).toBe("2027-09-15");
    expect(parseQuickAdd("Invalid 31.02", today)).toMatchObject({ title: "Invalid 31.02", dueDate: null });
  });

  it("marks tasks as important and keeps tags", () => {
    expect(parseQuickAdd("Ship the release friday #work !", today)).toEqual({
      title: "Ship the release #work",
      dueDate: "2026-10-02",
      important: true,
    });
  });

  it("leaves ordinary titles untouched", () => {
    expect(parseQuickAdd("Read “Tomorrow and tomorrow” again", today)).toEqual({
      title: "Read “Tomorrow and tomorrow” again",
      dueDate: null,
      important: false,
    });
    expect(parseQuickAdd("Tomorrow", today)).toEqual({ title: "Tomorrow", dueDate: null, important: false });
    expect(parseQuickAdd("Enjoy the sun", today).dueDate).toBeNull();
  });

  it("parses standalone phrases", () => {
    expect(parseDatePhrase("Next Week", today)).toBe("2026-10-08");
    expect(parseDatePhrase("someday", today)).toBeNull();
  });
});

describe("parseDatePhrase edge cases", () => {
  it("rolls past day-month dates into the next valid year", () => {
    expect(parseDatePhrase("29.02", "2027-03-01")).toBe("2028-02-29");
    expect(parseDatePhrase("29.02.2027", today)).toBeNull();
  });
});
