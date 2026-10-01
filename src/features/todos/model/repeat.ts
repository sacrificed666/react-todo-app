import { addDays, addMonths, fromDateKey } from "@/shared/lib/date";

import type { Repeat } from "./todo";

const WEEKEND = new Set([0, 6]);
const MAX_STEPS = 5000;

const advance = (key: string, repeat: Repeat) => {
  switch (repeat) {
    case "daily":
      return addDays(key, 1);
    case "weekdays": {
      let next = addDays(key, 1);
      while (WEEKEND.has(fromDateKey(next).getDay())) next = addDays(next, 1);
      return next;
    }
    case "weekly":
      return addDays(key, 7);
    case "monthly":
      return addMonths(key, 1);
    case "yearly":
      return addMonths(key, 12);
  }
};

export const nextOccurrence = (dueDate: string, repeat: Repeat, today: string) => {
  let next = advance(dueDate, repeat);
  for (let step = 0; next <= today && step < MAX_STEPS; step += 1) next = advance(next, repeat);
  return next;
};
