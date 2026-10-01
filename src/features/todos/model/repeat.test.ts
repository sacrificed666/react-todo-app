import { describe, expect, it } from "vitest";

import { nextOccurrence } from "./repeat";

describe("nextOccurrence", () => {
  it("advances by the repeat interval", () => {
    expect(nextOccurrence("2026-10-01", "daily", "2026-10-01")).toBe("2026-10-02");
    expect(nextOccurrence("2026-10-01", "weekly", "2026-10-01")).toBe("2026-10-08");
    expect(nextOccurrence("2026-10-01", "monthly", "2026-10-01")).toBe("2026-11-01");
    expect(nextOccurrence("2026-10-01", "yearly", "2026-10-01")).toBe("2027-10-01");
  });

  it("skips weekends for weekday repeats", () => {
    expect(nextOccurrence("2026-10-02", "weekdays", "2026-10-02")).toBe("2026-10-05");
    expect(nextOccurrence("2026-10-05", "weekdays", "2026-10-05")).toBe("2026-10-06");
  });

  it("clamps monthly and yearly repeats to the end of shorter months", () => {
    expect(nextOccurrence("2026-01-31", "monthly", "2026-01-31")).toBe("2026-02-28");
    expect(nextOccurrence("2028-02-29", "yearly", "2028-02-29")).toBe("2029-02-28");
  });

  it("jumps past today when a repeating task was completed late", () => {
    expect(nextOccurrence("2026-09-20", "daily", "2026-10-01")).toBe("2026-10-02");
    expect(nextOccurrence("2026-09-21", "weekly", "2026-10-01")).toBe("2026-10-05");
  });
});
