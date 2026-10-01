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

describe("parseQuickAdd in other languages", () => {
  it("understands relative days", () => {
    expect(parseQuickAdd("Zahnarzt anrufen morgen", today)).toMatchObject({
      title: "Zahnarzt anrufen",
      dueDate: "2026-10-02",
    });
    expect(parseQuickAdd("Comprar pan pasado mañana", today)).toMatchObject({
      title: "Comprar pan",
      dueDate: "2026-10-03",
    });
    expect(parseQuickAdd("Appeler maman aujourd'hui", today)).toMatchObject({ title: "Appeler maman", dueDate: today });
    expect(parseQuickAdd("Pagare la bolletta dopodomani", today).dueDate).toBe("2026-10-03");
    expect(parseQuickAdd("Boodschappen overmorgen", today).dueDate).toBe("2026-10-03");
    expect(parseQuickAdd("Zadzwonić do mamy jutro", today)).toMatchObject({
      title: "Zadzwonić do mamy",
      dueDate: "2026-10-02",
    });
    expect(parseQuickAdd("Sprawozdanie w przyszłym tygodniu", today).dueDate).toBe("2026-10-08");
    expect(parseQuickAdd("Rapport la semaine prochaine", today).dueDate).toBe("2026-10-08");
  });

  it("understands days counted from today", () => {
    expect(parseQuickAdd("Bericht in 3 Tagen", today).dueDate).toBe("2026-10-04");
    expect(parseQuickAdd("Informe dentro de 2 días", today).dueDate).toBe("2026-10-03");
    expect(parseQuickAdd("Rapport dans 5 jours", today).dueDate).toBe("2026-10-06");
    expect(parseQuickAdd("Relazione tra 4 giorni", today).dueDate).toBe("2026-10-05");
    expect(parseQuickAdd("Verslag over 2 dagen", today).dueDate).toBe("2026-10-03");
    expect(parseQuickAdd("Raport za 10 dni", today).dueDate).toBe("2026-10-11");
  });

  it("understands weekdays with articles and modifiers", () => {
    expect(parseQuickAdd("Teammeeting am Freitag", today)).toMatchObject({
      title: "Teammeeting",
      dueDate: "2026-10-02",
    });
    expect(parseQuickAdd("Reunión el próximo lunes", today)).toMatchObject({ title: "Reunión", dueDate: "2026-10-05" });
    expect(parseQuickAdd("Réunion lundi prochain", today).dueDate).toBe("2026-10-05");
    expect(parseQuickAdd("Riunione mercoledi", today).dueDate).toBe("2026-10-07");
    expect(parseQuickAdd("Vergadering op dinsdag", today).dueDate).toBe("2026-10-06");
    expect(parseQuickAdd("Spotkanie w piątek", today)).toMatchObject({ title: "Spotkanie", dueDate: "2026-10-02" });
  });

  it("accepts German day-month dates with a trailing dot", () => {
    expect(parseQuickAdd("Urlaub 24.12.", today).dueDate).toBe("2026-12-24");
    expect(parseQuickAdd("Urlaub 24.12.2027", today).dueDate).toBe("2027-12-24");
    expect(parseQuickAdd("Seite 20.102026", today)).toMatchObject({ title: "Seite 20.102026", dueDate: null });
  });

  it("does not mistake mornings for tomorrow", () => {
    expect(parseQuickAdd("Correr por la mañana", today)).toMatchObject({
      title: "Correr por la mañana",
      dueDate: null,
    });
    expect(parseQuickAdd("Joggen am Morgen", today)).toMatchObject({ title: "Joggen am Morgen", dueDate: null });
  });
});
